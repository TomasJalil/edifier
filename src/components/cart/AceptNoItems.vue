<template>
  <v-card :loading="loadingCart">
    <div class="d-flex justify-end mr-1 pt-1">
      <v-btn @click="close" x-small icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-card-title class="mt-n5">
      Ups, al parecer no disponemos de todos los productos
    </v-card-title>
    <v-card-text>
      <v-card-subtitle>
        A continuacion se muestra una lista de los productos que no disponemos
        en su totalidad:
      </v-card-subtitle>
      <v-row class="mt-0">
        <v-col
          cols="12"
          sm="4"
          md="4"
          lg="4"
          xl="4"
          v-for="(item, index) in data.order"
          :key="index"
        >
          <v-card>
            <v-card-text>
              <div class="d-flex">
                <!-- <p class="font-weight-bold black--text mb-0">Producto: </p> -->
                <p class="font-weight-bold mx-auto black--text text-uppercase">
                  {{ item.product.publication.product.name }}
                </p>
              </div>
              <div class="d-flex justify-center"></div>
              <div class="d-flex text-justify">
                <div>
                  <p class="mb-0 black--text">
                    <span>Cantidad Solicitada:</span>
                    <span class="ml-2">{{ item.requested }}</span>
                  </p>
                </div>
              </div>
              <div class="d-flex text-justify">
                <div>
                  <p class="mb-0 black--text">
                    <span>Cantidad Disponible:</span>
                    <!-- <pre>

                    {{ item }}
                    </pre> -->
                    <span class="ml-2">{{ item.available }}</span>
                  </p>
                </div>
                <!-- <p class="font-weight-bold black--text mb-0">
                  Cantidad Disponible:
                </p>
                <span class="ml-1">{{ item.available }}</span> -->
              </div>
              <v-divider class="mx-5 mt-2"></v-divider>
              <div class="d-flex justify-center mt-2">
                <v-avatar tile v-if="item.product.publication.images == null">
                  <img
                    height="200"
                    width="100%"
                    contain
                    src="@/assets/img/no_image.jpg"
                  />
                </v-avatar>
                <v-avatar size="200" tile v-else>
                  <v-img
                    :src="item.product.publication.images[0]"
                    contain
                  ></v-img>
                </v-avatar>
              </div>
              <div v-if="item.available > 0">
                <v-checkbox
                  v-model="accept[index]"
                  color="black"
                  @change="AcceptItems(item, index)"
                  label="Aceptar pedido"
                ></v-checkbox>
              </div>
              <p class="text-center text-caption" v-if="item.available > 0">
                Si acepta el pedido, usted compraria la cantidad que se dispone
                del mismo
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="close" text color="black">Cancelar</v-btn>
      <v-btn
        :loading="loadingCart"
        @click="HandlerAcceptItem"
        text
        color="blue"
      >
        Aceptar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { buildMercadoPagoReturnConfig } from "../../utils/checkout";
import { cleanPrice, trackStandard } from "../../utils/metaPixel";

export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => {},
    },
    pickup: {
      type: Boolean,
      required: true,
      default: false,
    },
    address: {
      type: Number,
      required: false,
      default: undefined,
    }
  },

  data() {
    return {
      accept: [],
      request: [],
      requestData: [],
      summaryData: {},
      cartAvilableItems: {},

      //Loading
      loadingCart: false,
    };
  },

  created() {
    this.HandlerGetSummary();
  },

  watch: {
    request(val) {
      this.updateCart(val);
    },
  },

  computed: {
    cartSummary() {
      return this.$store.getters["cart/GET_CART_SUMMARY"];
    },
  },

  methods: {
    trackAdjustedCheckoutStart() {
      const items =
        this.$store.getters["cart/CART_PRODUCTS"]?.shopping_cart_items || [];
      if (!items.length) return;
      const paymentType = this.data?.payment_type || "card";

      const contents = items
        .map(item => {
          const publicationId = item.publication_id || item.publication?.id;
          if (!publicationId) return null;
          const price = item.publication?.price || {};
          const itemPrice =
            paymentType === "installments"
              ? cleanPrice(price.pvp_18_installments ?? price.pvp)
              : paymentType === "bank_transfer"
                ? cleanPrice(price.pvp_transfer ?? price.pvp)
                : cleanPrice(price.pvp);
          return {
            id: String(publicationId),
            quantity: Number(item.original_quantity) || 0,
            item_price: itemPrice || 0
          };
        })
        .filter(Boolean);
      const value = contents.reduce(
        (acc, item) => acc + item.item_price * item.quantity,
        0
      );

      if (!value) return;

      trackStandard("InitiateCheckout", {
        value,
        num_items: contents.reduce((acc, item) => acc + item.quantity, 0),
        content_ids: contents.map(item => item.id),
        content_type: "product",
        contents
      });
    },

    close() {
      this.$emit("dialog:change", false);
    },

    async HandlerGetSummary() {
      try {
        const request = { update_items: true };
        const response = await this.$store.dispatch(
          "cart/CONFIRM_PRODUCTS_CART",
          request
        );

        const avilableItems = response.data.data.summary.map((res) => {
          return {
            publication_id: res.publication_id,
            quantity: res.requested,
            isValid: res.available > res.requested ? true : false,
          };
        });

        this.requestData = avilableItems;
      } catch (error) {
        console.log(error);
      }
    },

    AcceptItems(item, index) {
      const copyItem = [...this.requestData];
      const copyData = {
        publication_id: item.product.publication_id,
        quantity: this.accept[index] ? item.available : item.requested,
        isValid: this.accept[index] ? true : false,
      };
      copyItem.splice(index, 1, copyData);
      this.requestData = [...copyItem];
    },

    async updateCart(item) {
      try {
        this.loadingCart = true;
        const request = {
          items: item,
        };

        const response = await this.$store.dispatch(
          "cart/CREATE_CART",
          request
        );

        return response.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingCart = false;
      }
    },

    async HandlerAcceptItem() {
      try {
        const canPay = this.requestData.filter((res) => res.isValid == true);
        if (canPay.length == 0) {
          this.$snotify.warning(
            "Parece que no puedes comprar esta cantidad",
            "Alerta!"
          );
        } else {
          const updateCartItems = await this.updateCart(canPay);
          this.HandlerCheckout(updateCartItems.data.id);
        }
      } catch (error) {
        console.log(error);
      }
    },

    async HandlerCheckout(shopping_cart_id) {
      try {
        this.loadingCart = true;
        try {
          await this.$store.dispatch("cart/GET_CURRENT_CART");
        } catch (error) {
          console.log("No se pudo refrescar el carrito antes del tracking", error);
        }
        this.trackAdjustedCheckoutStart();
        const { notificationUrl, autoReturn, backUrls } =
          buildMercadoPagoReturnConfig();
        const request = {
          shopping_cart_id: shopping_cart_id,
          route_success: notificationUrl,
          route_failure: notificationUrl,
          route_pending: notificationUrl,
          auto_return: autoReturn,
          back_urls: backUrls,
          store_pickup: this.pickup,
          addresse_id: this.address,
          warehouse_id: "",
        };

        const response = await this.$store.dispatch(
          "products/CHECKOUT_DO",
          request
        );

        console.log(response);
        window.location.replace(response.data.data.url);
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingCart = false;
      }
    },
  },
};
</script>

<style>
</style>
