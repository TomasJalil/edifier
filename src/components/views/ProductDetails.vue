<template>
  <div>
    <div
      :style="
        sticky
          ? 'background-color: #ffffff; height: auto'
          : 'background-color: #ffffff; height: auto'
      "
      :class="sticky ? 'header-sticky' : ''"
      v-scroll="onScroll"
    >
      <div style="background-color: #c9cdd9; height: 0px"></div>
      <v-tabs
        class="d-flex justify-center"
        color="#797A7E"
        background-color="#FFFFFF"
        slider-color="#0EA4E9"
      >
        <v-tab @click="$vuetify.goTo('#product')">
          {{ dataProduct.keywords }}
        </v-tab>
        <v-tab @click="$vuetify.goTo('#detalle_producto')">Descripción</v-tab>
        <v-tab @click="$vuetify.goTo('#especificaciones')">
          Especificaciones
        </v-tab>
        <v-tab
          @click="HandlerDowloadManual"
          v-if="
            dataProduct.product != null &&
              dataProduct.product.product_manual !== null
          "
        >
          <span v-if="!loadingManual">MANUAL DE USUARIO</span>
          <span v-else>...</span>
        </v-tab>
      </v-tabs>
    </div>
    <v-sheet color="#EBF1F7" id="product">
      <div class="py-15" v-if="sticky"></div>
      <v-container
        :fluid="
          $vuetify.breakpoint.name == 'lg' || $vuetify.breakpoint.name == 'xl'
            ? false
            : true
        "
      >
        <v-row justify="center" class="mt-10">
          <v-col cols="12" sm="6" md="5">
            <v-img
              :src="dataProduct.images[0]"
              :lazy-src="dataProduct.images[0]"
              contain
              v-if="dataProduct.images != null"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <div
              class="py-15"
              v-if="!$vuetify.breakpoint.smAndDown && !messageProductAdd"
            ></div>
          </v-col>
          <v-col cols="12" sm="6" md="5" class="ml-md-15 d-flex flex-column">
            <div>
              <div class="title-font-2 text-uppercase">
                {{ dataProduct.keywords }}
              </div>
              <div class="mt-5 text-17">
                <span
                  style="line-height: 28px"
                  v-html="dataProduct.resume"
                ></span>
              </div>
            </div>
            <div class="mt-auto">
              <price-details
                :prices="dataProduct.price"
                :isAuth="isAuth"
                :show_full_prices="dataProduct.store.display_full_prices"
              />
              <div class="details-box">
                <availability-list :dataProduct="dataProduct" />
              </div>
              <div class="d-flex justify-space-between mt-10">
                <cp-information
                  v-if="dataProduct"
                  :dataProduct="dataProduct"
                  :authUser="authUser"
                  class="mt-auto"
                />
              </div>

              <!-- <div class="mt-4 mb-2">
                <div
                  v-if="
                    dataProduct.product != null &&
                    dataProduct.product.product_warehouse.length > 0
                  "
                >
                  <span class="mr-0">
                    {{ getWarehouse(dataProduct.product.product_warehouse) }}
                  </span>
                </div>
                <span style="color: #00a0e9" class="mr-2">
                  Este paquete sera preparado antes de:
                </span>
                {{ getDate() | formatDay }}
              </div> -->

              <div
                v-if="validateStock()"
                class="d-flex align-center justify-start py-1"
              >
                <span class="mx-0 text-uppercase" style="font-weight: 500">
                  Cantidad
                </span>
                <span class="ml-1">
                  <v-avatar size="35">
                    <v-btn
                      @click="HandlerQuantity('minus')"
                      color="white"
                      fab
                      x-small
                      class="mx-2 mx-md-0 elevation-0"
                    >
                      <v-icon color="black">mdi-minus</v-icon>
                    </v-btn>
                  </v-avatar>
                  <span class="mx-2">
                    {{ quantity }}
                  </span>
                  <v-avatar @click="HandlerQuantity('plus')" size="35">
                    <v-btn
                      color="white"
                      fab
                      x-small
                      class="mx-0 mx-md-0 elevation-0"
                    >
                      <v-icon color="black">mdi-plus</v-icon>
                    </v-btn>
                  </v-avatar>
                </span>
              </div>
              <div
                class="d-md-flex justify-space-between mt-5"
                style="width: 80%"
                v-if="validateStock()"
              >
                <div class="d-flex flex-column flex-sm-row flex-grow-1">
                  <v-btn
                    style="border-width: medium"
                    rounded
                    dark
                    color="#00A0E9"
                    @click="HandlerBuy()"
                    class="mt-1 mt-sm-0 font-weight-bold mr-sm-2"
                  >
                    Comprar ahora
                  </v-btn>
                  <v-btn
                    style="border-width: medium"
                    rounded
                    outlined
                    color="#00A0E9"
                    @click="HandlerAddCart()"
                    class="mt-2 mt-sm-0 font-weight-bold ml-sm-2"
                  >
                    Agregar al carrito
                  </v-btn>
                </div>

                <div class="d-flex mt-2 mt-md-0 ml-md-4">
                  <v-btn
                    style="border-width: medium"
                    fab
                    color="#5A5953"
                    x-small
                  >
                    <v-icon color="white">mdi-share-variant-outline</v-icon>
                  </v-btn>
                  <span
                    class="mt-2 ml-1"
                    style="font-size: 12px; font-weight: 600"
                  >
                    COMPARTIR
                  </span>
                </div>
              </div>
            </div>
            <div
              class="py-15"
              v-if="!$vuetify.breakpoint.smAndDown && !messageProductAdd"
            ></div>
            <div
              v-if="$vuetify.breakpoint.smAndDown"
              class="py-md-15 py-10"
            ></div>
          </v-col>
          <v-col offset-md="6" md="6" v-if="messageProductAdd">
            <div class="mb-15 d-flex ml-7">
              <p
                style="color: #00a0e9; cursor: pointer"
                @click="$router.push({ name: 'cart' })"
              >
                Agregaste {{ dataProduct.keywords }} x {{ quantity }}. ir a mi
                Lista de Compras.
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <v-container>
      <v-row class="d-flex" justify="center">
        <v-card
          width="150px"
          height="auto"
          v-for="(item, index) in dataProduct.images"
          :key="index"
          class="mt-n15 mt-sm-n10 mt-md-n15 mr-3"
          v-show="index != 0"
          @click="
            () => {
              showImageBackground = true;
              imageBackground = item;
            }
          "
        >
          <v-hover v-slot="{ hover }">
            <v-img
              contain
              :src="item"
              :lazy-src="item"
              :class="hover ? 'elevation-15' : ''"
              :style="
                hover
                  ? 'cursor: pointer; opacity: 0.8; background-color: black; z-index:10;'
                  : ''
              "
            >
              <v-row
                v-if="hover"
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-btn fab color="white" small>
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </v-row>
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-hover>
        </v-card>
      </v-row>
    </v-container>
    <div class="py-5"></div>
    <v-dialog v-model="showImageBackground" width="600">
      <image-background
        :imageBackground="imageBackground"
        @close:change="closeImageBackground"
      />
    </v-dialog>

    <div v-html="dataProduct.text_html"></div>
    <suscribe-component />

    <v-snackbar
      v-model="snackbar"
      :timeout="4000"
      top
      right
      color="white"
      elevation="2"
      class="mt-15 mr-5"
      rounded="lg"
      transition="slide-x-reverse-transition"
    >
      <div class="d-flex align-center pa-2">
        <v-avatar size="48" class="mr-3 rounded-lg" color="grey lighten-5">
           <v-img 
             v-if="dataProduct.images && dataProduct.images.length > 0"
             :src="dataProduct.images[0]" 
             contain
           ></v-img>
        </v-avatar>
        <div class="d-flex flex-column">
           <span class="font-weight-bold grey--text text--darken-3 text-subtitle-2">¡Agregado al carrito!</span>
           <span class="caption grey--text text--darken-1 text-truncate" style="max-width: 200px;">{{ dataProduct.keywords }}</span>
        </div>
        <v-btn
          icon
          small
          color="grey lighten-1"
          class="ml-auto align-self-start mt-n1 mr-n1"
          @click="snackbar = false"
        >
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="d-flex justify-end px-2 pb-2">
         <v-btn 
           text 
           x-small 
           color="#00A0E9" 
           class="font-weight-bold"
           @click="$router.push({ name: 'cart' })"
         >
           Ver Carrito
         </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import moment from "moment";
import SuscribeComponent from "@/components/Utils/suscribe_component";
import informationCP from "@/components/Utils/informationCP";
import ImageBackground from "./utils/ImageBackground";
import ProductDetailsPrices from "./utils/products/ProductDetailsPrices";
import { isValidUmbral } from "@/utils/validateUmbral.js";
import AvailabilityList from "./utils/products/AvailabilityList.vue";
import { cleanPrice, trackStandard, trackCustom } from "@/utils/metaPixel";
import {
  pushEcommerce,
  buildItem,
  CURRENCY
} from "@/utils/googleAnalytics";

export default {
  components: {
    "suscribe-component": SuscribeComponent,
    "cp-information": informationCP,
    "image-background": ImageBackground,
    "price-details": ProductDetailsPrices,
    "availability-list": AvailabilityList
  },

  data() {
    return {
      dataProduct: {},
      productImages: [],
      quantity: 1,
      productCart: [],
      colorHeart: "black",
      iconHeart: "mdi-heart-outlined",
      id: "",
      action: 1,
      messageProductAdd: false,
      //CHAZKI
      chazkiResponse: null,
      //loading
      loading: false,
      // Imagen
      showImageBackground: false,
      imageBackground: "",
      //Navbar
      active: false,
      sticky: false,
      fab: false,
      loadingManual: false,

      //Avisame
      showModalReserve: false,
      email: "",
      name: "",
      phone: "",
      snackbar: false
    };
  },

  async created() {
    trackCustom("ProductDetailsView");
    this.HandlerGetProducts(this.id);

    if (this.isAuth) {
      this.HandlerGetCartsProducts();
      const responseChazki = await this.$store.dispatch(
        "products/CHAZKI_VALIDATE"
      );
      this.responseChazki = responseChazki.data.data;
    }
  },

  watch: {
    dataProduct(newProduct) {
      if (this._viewContentSent) return;
      if (!newProduct || !newProduct.id) return;
      const price = newProduct.price || {};
      const value = cleanPrice(price.pvp);
      if (value === null) return;
      this._viewContentSent = true;
      trackStandard("ViewContent", {
        content_ids: [String(newProduct.id)],
        content_type: "product",
        content_name: newProduct.keywords || "",
        content_category: newProduct.category_name || newProduct.category || undefined,
        value
      });
      pushEcommerce("view_item", {
        currency: CURRENCY,
        value,
        items: [buildItem(newProduct, { quantity: 1 })]
      });
    }
  },

  computed: {
    isAuth() {
      return this.$store.getters["auth/AUTHENTICATED"];
    },

    authUser() {
      return this.$store.getters["auth/GET_PROFILE"];
    },

    productCartState() {
      return this.$store.getters["cart/CART_PRODUCTS"];
    },

    breakpoint() {
      return this.$vuetify.breakpoint.name;
    }
  },

  filters: {
    currencyPVP(value) {
      if (value) {
        const AMOUNT_FORMAT = new Intl.NumberFormat("de-DE", {
          // currency: "ARS",
          // style: "currency",
          maximumFractionDigits: 0,
          minimumFractionDigits: 0
        }).format(value);
        return AMOUNT_FORMAT;
      } else {
        return " ";
      }
    },

    formatDay(value) {
      return moment(value).format("HH:mm DD/MM/YYYY");
    },

    currency(value) {
      if (value) {
        // es-AR
        const AMOUNT_FORMAT = new Intl.NumberFormat("de-DE", {
          // currency: "USD",
          // style: "currency",
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        }).format(value);
        return AMOUNT_FORMAT;
      } else {
        return " ";
      }
    }
  },

  methods: {
    toggleNavClass() {
      if (this.active == false) return "nav";
      return "sticky-nav";
    },

    quotes(pvp) {
      const value = (pvp * this.quantity) / 18;
      return value;
    },

    HandlerGetProducts(id) {
      if (!this.isAuth) this.HandlerGetProductsNoAuth(id);
      if (this.isAuth) this.HandlerGetAuthProducts(id);
    },

    async HandlerGetProductsNoAuth() {
      try {
        this.loadingResponse = true;
        const { brand, keywords } = this.$route.params;

        const response = await this.$store.dispatch(
          "products/GET_PUBLICATION_DETAILS",
          {
            product_brand: brand,
            publication_title: keywords.replaceAll("-", " ")
          }
        );

        this.dataProduct = response.data.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingResponse = false;
      }
    },

    async HandlerGetAuthProducts() {
      try {
        this.loadingResponse = true;
        const { brand, keywords } = this.$route.params;

        const response = await this.$store.dispatch(
          "products/GET_PUBLICATION_DETAILS",
          {
            product_brand: brand,
            publication_title: keywords.replaceAll("-", " ")
          }
        );

        this.dataProduct = response.data.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingResponse = false;
      }
    },

    async HandlerGetCartsProducts() {
      try {
        await this.$store.dispatch("cart/GET_CURRENT_CART");
      } catch (error) {
        console.log(error);
      }
    },

    HandlerQuantity(quantity) {
      const productWarehouse = { ...this.dataProduct };
      const userZipCode =
        this.authUserData?.zipcode ?? localStorage.getItem("zipcode");
      const paylod = { zipCode: userZipCode, dataProduct: productWarehouse };

      const threshold = isValidUmbral(paylod);

      if (this.quantity == 1 && quantity == "minus") {
        return;
      } else if (
        quantity == "plus" &&
        this.quantity < threshold &&
        this.quantity < 4
      ) {
        this.quantity++;
      } else if (quantity == "minus") {
        this.quantity--;
      }
    },

    async HandlerAddFavorites(item) {
      try {
        const request = {
          publication_id: item.id,
          page: 1,
          per_page: 1,
          paginate: false
        };

        const response = await this.$store.dispatch(
          "products/ADD_FAVORITES",
          request
        );
        const data = response.data.data;
        this.HandlerGetAuthProducts();
        this.$snotify.success(
          `${
            data.product_favorite[0].status == true
              ? "Has agregado como favorito"
              : "Has retirado de favorito"
          }`,
          "Exitos!"
        );
      } catch (error) {
        console.log(error);
      }
    },

    HandlerShowFavoriteIcon(product) {
      if (product == null) {
        this.colorHeart = "black";
        this.iconHeart = "mdi-heart-outline";
        return "mdi-heart-outline";
      } else if (product != null && product.status == true) {
        this.colorHeart = "red";
        this.iconHeart = "mdi-heart";
        return "mdi-heart";
      } else {
        this.colorHeart = "black";
        this.iconHeart = "mdi-heart-outline";
        return "mdi-heart-outline";
      }
    },

    async HandlerAddCart() {
      try {
        const cart = this.productCartState;
        
        // Ensure shopping_cart_items exists
        if (!cart || !cart.shopping_cart_items) {
            if (!cart) this.$store.commit("cart/SET_ITEM", { shopping_cart_items: [] });
        }
        const currentCart = this.productCartState; // Re-fetch to be sure

        const existingProduct = currentCart.shopping_cart_items.find(
          p => this.dataProduct.id === p.publication_id
        );

        if (existingProduct) {
          const newQuantity = existingProduct.original_quantity + this.quantity;
          this.$store.commit("cart/UPDATE_ITEM_QUANTITY", {
            publication_id: this.dataProduct.id,
            quantity: newQuantity
          });
        } else {
          this.$store.commit("cart/ADD_ITEM", {
            ...this.dataProduct,
            original_quantity: this.quantity
          });
        }

        this.$store.commit("cart/TOTAL_AMOUNT", { items: currentCart.shopping_cart_items });

        // Pixel fires immediately after local commit — before any API sync so a
        // network failure can't silently swallow the event.
        const unitPrice = cleanPrice(this.dataProduct?.price?.pvp);
        const addedQuantity = this.quantity;
        if (unitPrice !== null) {
          const totalValue = unitPrice * addedQuantity;
          trackStandard("AddToCart", {
            content_ids: [String(this.dataProduct.id)],
            content_type: "product",
            content_name: this.dataProduct.keywords || "",
            contents: [{ id: String(this.dataProduct.id), quantity: addedQuantity, item_price: unitPrice }],
            value: totalValue
          });
          pushEcommerce("add_to_cart", {
            currency: CURRENCY,
            value: totalValue,
            items: [buildItem(this.dataProduct, { quantity: addedQuantity, price: unitPrice })]
          });
        }

        this.messageProductAdd = true;
        this.snackbar = true;

        // Server sync — runs after UX feedback and tracking.
        if (this.isAuth) {
          if (existingProduct) {
            const request = currentCart.shopping_cart_items.map(prod => ({
              publication_id: prod.publication_id,
              quantity: prod.original_quantity
            }));
            await this.$store.dispatch("cart/CREATE_CART", { items: [...request] });
          } else {
            const request = currentCart.shopping_cart_items
              .map(prod => ({ publication_id: prod.publication_id, quantity: prod.original_quantity }))
              .filter(p => p.publication_id != null);
            await this.$store.dispatch("cart/CREATE_CART", { items: [...request] });
            await this.$store.dispatch("cart/GET_CURRENT_CART");
          }
        }
      } catch (error) {
        console.log(error);
        const errorMessage = error?.response?.data?.errors[0]?.message;
        if (errorMessage === "range validation failed on quantity") {
          this.$snotify.error(
            "No se puede agregar más unidades de este producto al carrito.",
            "Error"
          );
        } else {
          this.$snotify.error(
            "Ha ocurrido un error agregando el producto.",
            "Error"
          );
        }
      }
    },

    async HandlerBuy() {
      try {
        // Si no está autenticado, agregar al carrito y redirigir al carrito
        if (!this.isAuth) {
          await this.HandlerAddCart();
          setTimeout(() => {
            this.$router.push({ name: "cart" });
          }, 300);
          return;
        }

        const request = {
          update_items: true
        };

        const response = await this.$store.dispatch(
          "cart/CONFIRM_PRODUCTS_CART",
          request
        );

        const productId = this.dataProduct.product_id;
        // AGREGAR PRODUCTO AL CARRITO E IR A COMPRAR
        const searchProduct = response.data.data.shopping_cart.shopping_cart_items.find(
          product => {
            if (product.publication.product_id == productId) {
              return product;
            }
          }
        );
        // MANDAR AL CHECKOUT PARA PAGAR
        if (searchProduct != undefined) {
          this.$router.push({ name: "cart" });
        } else {
          // AGREGAR E IR A CHECKOUT
          this.HandlerAddCart();
          setTimeout(() => {
            this.$router.push({ name: "cart" });
          }, 500);
        }
      } catch (error) {
        console.log(error);
      }
    },

    onScroll(e) {
      if (typeof window === "undefined") return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.fab = top > 50;
      if (top > 50) {
        this.sticky = true;
      } else {
        this.sticky = false;
      }
    },

    validateStock() {
      return (
        this.dataProduct.product.product_warehouse.some(
          ele => ele.current_stock !== 0
        ) &&
        !this.dataProduct.store.out_stock &&
        !this.dataProduct.out_stock
      );
    },

    validateUmbral() {
      const userZipCode =
        this.authUserData?.zipcode ?? localStorage.getItem("zipcode");

      const dataProductValue = { ...this.dataProduct };
      const paylod = { zipCode: userZipCode, dataProduct: dataProductValue };

      return isValidUmbral(paylod) > 0 ? true : false;
    },

    HandlerAvisame() {
      this.showModalReserve = true;
    },

    async HandlerNotification() {
      try {
        this.loading = true;
        const request = {
          store_id: 3,
          product_id: this.dataProduct.product_id,
          publication_id: this.dataProduct.id,
          email: this.authUser.buyer.email,
          name: this.authUser.buyer.first_name,
          phone: this.authUser.buyer.phone
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

    getWarehouse(warehouse) {
      const cpUser = parseInt(this.authUser?.address?.zipcode);
      for (const iterator of warehouse) {
        if (iterator.warehouse_id === 5 && cpUser !== 2000 && cpUser !== 5000) {
          return "Stock en Central";
        }
        if (iterator.warehouse_id === 10 && cpUser === 2000) {
          return "Stock en Rosario";
        }
        if (iterator.warehouse_id === 3 && cpUser === 5000) {
          return "Stock en Cordoba";
        }
      }
      return "Sin Stock";
    },

    getDate() {
      // const date = moment().format("YYYY-MM-DD HH:mm:ss");
      // return date
      const dateParse = moment().format("YYYY/MM/DD HH:mm:ss");
      const numberDay = moment(dateParse).day();
      const dateHour = moment(dateParse).format("HH:mm:ss");

      // FORMATO 24HRS
      // const hour = moment(dateParse).format("HH:mm");
      // const dateHour = moment(hour, ["h:mm A"]).format("HH:mm:ss");

      if (numberDay > 0 && numberDay <= 5) {
        const format = "HH:mm:ss";
        const time = moment(dateHour, format);
        const firstTime = moment("00:00:00", format);
        const secondTime = moment("08:59:00", format);

        const firstTime2 = moment("09:00:00", format);
        const secondTime2 = moment("16:30:00", format);

        // console.log('time', time)
        // console.log('firstTime', firstTime)
        // console.log('secondTime', secondTime)

        /**
         * 00:00:00 / 08:59:00
         */
        if (time.isBetween(firstTime, secondTime)) {
          // console.log('primero',date)
          return "9:30 " + moment(dateParse).format("YYYY/MM/DD");
        } else if (time.isBetween(firstTime2, secondTime2)) {
          /**
           * 09:00:00 / 16:30:00
           */
          // console.log('segundo', date)

          const add30Min = moment(time)
            .add(30, "m")
            .format("HH:mm");
          return `${add30Min} ${moment(dateParse).format("YYYY/MM/DD")}`;
        } else {
          const currentDay = moment(dateParse).format("YYYY/MM/DD");
          const addNextDay = moment(currentDay)
            .add(1, "d")
            .format("YYYY/MM/DD");
          return "09:30" + " " + addNextDay;
        }
      } else {
        const number_diff = numberDay == 0 ? 1 : 2;
        const currentDay = moment(dateParse).format("YYYY/MM/DD");
        const addNextDay = moment(currentDay)
          .add(number_diff, "d")
          .format("YYYY/MM/DD");
        return "09:30" + " " + addNextDay;
      }
    },

    async HandlerDowloadManual() {
      window.open(this.dataProduct.product.product_manual, "manual_de_usuario");
    },

    closeImageBackground() {
      this.showImageBackground = false;
    }
  }
};
</script>

<style>
.title-font-2 {
  font-size: 2.5em;
  font-weight: 600;
}

.header-sticky {
  position: fixed;
  width: 100%;
  /* top: 0; */
  z-index: 1;
  margin-bottom: 50px !important;
}

.v-dialog {
  border-radius: 4px;
  margin: 24px;
  overflow-y: hidden;
  pointer-events: auto;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 100%;
  z-index: inherit;
  box-shadow: 0 11px 15px -7px rgb(0 0 0 / 20%),
    0 24px 38px 3px rgb(0 0 0 / 14%), 0 9px 46px 8px rgb(0 0 0 / 12%);
}

.text-20 {
  font-size: 2.5em;
}

.text-17 {
  font-size: 17px !important;
}

.in {
  line-height: 25px in !important;
}

.weight-medium {
  font-weight: 400;
}
.details-box .availableBox {
  margin-top: 6px !important;
  margin-bottom: -20px !important;
  display: flex;
  align-items: start;
  justify-content: start;
}
</style>
