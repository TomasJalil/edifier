<template>
  <div>
    <div class="mb-5">
      <v-btn
        v-if="!canPurchase()"
        @click.stop="HandlerModalAvisame()"
        class="mt-0 white--text"
        rounded
        color="#00A0E9"
      >
        AVISAME
      </v-btn>
      <div
  v-else-if="showActions && $route.name !== 'cart'"
  class="d-flex flex-column align-center action-wrapper"
>
  <v-btn
    color="#00A0E9"
    class="white--text text-capitalize action-btn"
    rounded
    @click.stop="handleBuyNow()"
  >
    Comprar ahora
  </v-btn>

  <v-btn
    outlined
    color="#00A0E9"
    class="text-capitalize action-btn"
    rounded
    @click.stop="handleAddToCart()"
  >
    Agregar al carrito
  </v-btn>
</div>

    </div>

    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-dialog
        v-if="showModalReserve"
        v-model="showModalReserve"
        max-width="600"
      >
        <v-card>
          <v-card-title>
            Completá con tus datos y nos comunicaremos
          </v-card-title>
          <v-card-text>
            <ValidationProvider
              name="nombre"
              rules="required"
              v-slot="{ errors }"
            >
              <v-text-field
                filled
                rounded
                v-model="inputName"
                label="Nombre"
                :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
            <ValidationProvider
              name="email"
              rules="email|required"
              v-slot="{ errors }"
            >
              <v-text-field
                filled
                rounded
                label="Email"
                v-model="inputEmail"
                :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
            <ValidationProvider
              name="teléfono"
              rules="numeric|min:8|required"
              v-slot="{ errors }"
            >
              <v-text-field
                filled
                rounded
                label="Teléfono"
                v-model="inputPhone"
                :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showModalReserve = false">Cancelar</v-btn>
            <v-btn
              rounded
              :loading="loading"
              color="#00A0E9"
              class="white--text"
              @click="passes(HandlerNotification)"
              >Continuar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </ValidationObserver>
  </div>
</template>

<script>
import moment from "moment";
import { isValidUmbral } from "@/utils/validateUmbral.js";
import { canPurchasePublication } from "@/utils/purchaseState";
import { cleanPrice, trackStandard } from "@/utils/metaPixel";
import { pushEcommerce, buildItem, CURRENCY } from "@/utils/googleAnalytics";

export default {
  props: {
    dataProduct: {
      type: Object,
      required: false,
      default: () => {}
    },
    authUser: {
      type: Object,
      required: true,
      default: () => {}
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      loading: false,
      showModalReserve: false,

      //Data
      email: "",
      name: "",
      phone: "",
      responseChazki: null,

      //Notification
      activeNotificacion: false,
      textNotification: "",
      colorNotification: "black",
      warehouseValue: 0
    };
  },

  async created() {
    if (this.isAuth) {
      const responseChazki = await this.$store.dispatch(
        "products/CHAZKI_VALIDATE"
      );
      this.responseChazki = responseChazki.data.data;
    }
  },

  computed: {
    isAuth() {
      return this.$store.getters["auth/AUTHENTICATED"];
    },

    authUserData() {
      return this.$store.getters["auth/GET_PROFILE"];
    },

    inputName: {
      get() {
        return this.isAuth
          ? this.authUserData.buyer.first_name
          : this.customName;
      },
      set(value) {
        if (this.isAuth) {
          this.authUserData.buyer.first_name = value;
        } else {
          this.customName = value;
        }
      }
    },

    inputEmail: {
      get() {
        return this.isAuth ? this.authUserData.buyer.email : this.customEmail;
      },
      set(value) {
        if (this.isAuth) {
          this.authUserData.buyer.email = value;
        } else {
          this.customEmail = value;
        }
      }
    },

    inputPhone: {
      get() {
        return this.isAuth ? this.authUserData.buyer.phone : this.customPhone;
      },
      set(value) {
        if (this.isAuth) {
          this.authUserData.buyer.phone = value;
        } else {
          this.customPhone = value;
        }
      }
    },

    productCartState() {
      return this.$store.getters["cart/CART_PRODUCTS"];
    }
  },

  methods: {
    trackAddToCart(publication, quantity = 1) {
      const unitPrice = cleanPrice(publication?.price?.pvp);
      if (unitPrice === null) return;

      const totalValue = unitPrice * quantity;
      trackStandard("AddToCart", {
        content_ids: [String(publication.id)],
        content_type: "product",
        content_name: publication.keywords || publication.name || "",
        contents: [
          {
            id: String(publication.id),
            quantity,
            item_price: unitPrice
          }
        ],
        value: totalValue
      });

      const gaItem = buildItem(publication, {
        quantity,
        price: unitPrice
      });
      pushEcommerce("add_to_cart", {
        currency: CURRENCY,
        value: totalValue,
        items: gaItem ? [gaItem] : []
      });
    },

    HandlerReturnWarehouse(cp, warehouse) {
      switch (parseInt(cp)) {
        case 2000:
          return this.getDeposit(warehouse, 10, 5);
        case 5000:
          return this.getDeposit(warehouse, 3, 5);
        default:
          return this.getDepostCentral(warehouse, cp, 5);
      }
    },

    getDepostCentral(warehouse, cp, cenId) {
      const getWarehouseFwl01 = warehouse.find(
        value => value.warehouse_id == cenId
      );
      if (getWarehouseFwl01?.current_stock > 0) {
        if (cp >= 1000 && cp < 1441) {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} dentro de las 24Hs HÁBILES`;
        } else if (this.responseChazki == true) {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} dentro de las 72Hs HÁBILES`;
        } else {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} en 4-6 días hábiles`;
        }
      } else {
        return "AVISAME";
      }
    },

    getDeposit(warehouse, regId, cenId) {
      const getWarehouseReg = warehouse.find(
        value => value.warehouse_id == regId
      );

      const getWarehouseFwl01 = warehouse.find(
        value => value.warehouse_id == cenId
      );

      if (getWarehouseReg != undefined && getWarehouseFwl01 != undefined) {
        if (
          getWarehouseReg.current_stock > 0 &&
          getWarehouseFwl01.current_stock > 0
        ) {
          // if (this.warehouseValue === 5) {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} dentro de las 24Hs HÁBILES `;
          // } else {
          //   let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          //   return `${text} en 4-6 días hábiles`;
          // }
        } else if (
          getWarehouseReg.current_stock === 0 &&
          getWarehouseFwl01.current_stock > 0
        ) {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} en 4-6 días hábiles`;
        } else if (
          getWarehouseReg.current_stock > 0 &&
          getWarehouseFwl01.current_stock == 0
        ) {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} dentro de las 24Hs HÁBILES `;
        } else if (
          getWarehouseReg.current_stock == 0 &&
          getWarehouseFwl01.current_stock == 0
        ) {
          return "AVISAME";
        }
      } else if (
        getWarehouseReg == undefined &&
        getWarehouseFwl01 != undefined
      ) {
        if (getWarehouseFwl01.current_stock > 0) {
          let text = this.$route.name == "cart" ? "Llega" : "RECIBILO";
          return `${text} dentro de las 72Hs HÁBILES`;
        } else if (getWarehouseFwl01.current_stock == 0) {
          return "AVISAME";
        }
      } else if (
        getWarehouseReg != undefined &&
        getWarehouseFwl01 == undefined
      ) {
        if (getWarehouseReg.current_stock > 0) {
          return "Entrega o Retira en el día";
        } else if (getWarehouseReg.current_stock == 0) {
          return "AVISAME";
        }
      }
    },

    ModalProductUser(zip_code, warehouse) {
      if (
        this.HandlerReturnWarehouse(zip_code, warehouse) == "AVISAME" &&
        this.dataProduct.user_product_notification == null
      ) {
        this.showModalReserve = true;
      }
    },

    async HandlerNotification() {
      try {
        this.loading = true;
        const request = {
          store_id: 3,
          product_id: this.dataProduct.product_id,
          publication_id: this.dataProduct.id,
          email: this.authUserData.buyer.email,
          name: this.authUserData.buyer.first_name,
          phone: this.authUserData.buyer.phone
        };

        await this.$store.dispatch(
          "products/PRODUCT_NOTIFICATION_USER",
          request
        );

        this.showModalReserve = false;
        this.dataProduct.user_product_notification = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    getMonth() {
      return moment()
        .add(1, "month")
        .locale("es")
        .format("MMMM");
      // const currentDay = moment().format("DD");
      // const currentMonth = moment().format("MM") - 1;
      // if (currentDay < 15) {
      //   return moment().locale("es").format("MMMM");
      // }
      // return moment()
      //   .month(parseInt(currentMonth) + 1)
      //   .locale("es")
      //   .format("MMMM");
    },

    validateUmbral() {
      const userZipCode = this.authUserData.zipcode;
      const dataProductValue = { ...this.dataProduct };
      const paylod = { zipCode: userZipCode, dataProduct: dataProductValue };

      return isValidUmbral(paylod) > 0 ? true : false;
    },

    HandlerModalAvisame() {
      if (this.isAuth) {
        this.showModalReserve = true;
      } else {
        this.$router.push({ name: "login" });
      }
    },
    inStock() {
      return (
        this.dataProduct.product.product_warehouse.some(
          ele => ele.current_stock !== 0
        ) &&
        !this.dataProduct.store.out_stock &&
        !this.dataProduct.out_stock
      );
    },

    canPurchase() {
      if (!this.inStock()) return false;
      return canPurchasePublication(this.dataProduct, this.validateUmbral());
    },

    async handleAddToCart(publication = this.dataProduct, goToCart = false) {
      if (!this.canPurchase()) return;
      try {
        const cartState = this.productCartState;

        if (!cartState || !cartState.shopping_cart_items) {
          if (!cartState) {
            this.$store.commit("cart/SET_ITEM", { shopping_cart_items: [] });
          }
        }

        const currentCart = this.productCartState;
        const existingItem = currentCart.shopping_cart_items.find(
          item => item.publication_id === publication.id
        );

        if (existingItem) {
          const newQuantity = (existingItem.original_quantity || 0) + 1;
          this.$store.commit("cart/UPDATE_ITEM_QUANTITY", {
            publication_id: publication.id,
            quantity: newQuantity
          });
        } else {
          this.$store.commit("cart/ADD_ITEM", {
            ...publication,
            original_quantity: 1
          });
        }

        this.trackAddToCart(publication, 1);

        const normalizedItems = this.productCartState.shopping_cart_items.map(
          item => ({
            publication_id: item.publication_id,
            quantity: item.original_quantity
          })
        );

        if (this.isAuth) {
          await this.$store.dispatch("cart/CREATE_CART", {
            items: normalizedItems
          });
          await this.$store.dispatch("cart/GET_CURRENT_CART");
        } else {
          this.$store.commit("cart/TOTAL_AMOUNT", {
            items: this.productCartState.shopping_cart_items
          });
        }

        if (goToCart) {
          this.$router.push({ name: "cart" });
        } else {
          this.$snotify.success(
            "Producto agregado al carrito",
            "¡Listo!"
          );
        }
      } catch (error) {
        this.$snotify.error(
          "No se pudo agregar el producto al carrito.",
          "Error"
        );
      }
    },

    async handleBuyNow(publication = this.dataProduct) {
      if (!this.canPurchase()) return;
      await this.handleAddToCart(publication, true);
    }
  }
};
</script>

<style scoped>
.action-wrapper {
  gap: 10px;
}

.action-btn {
  min-width: 160px;
}
</style>
