<template>
  <v-container>
    <div v-if="!loadingAutorize">
      <v-row justify="center" v-if="isValid">
        <v-col cols="12" sm="12" md="4">
          <v-img contain src="@/assets/img/notificationGood.svg"></v-img>
        </v-col>
        <v-col
          cols="12"
          sm="12"
          md="4"
          class="d-flex align-self-center justify-center"
        >
          <div>
            <span
              style="font-size: 18px; color: #6c63ff"
              class="font-weight-bold text-center"
              v-html="messageNotification"
            ></span>
          </div>
        </v-col>
        <v-col cols="12" sm="12" md="12" class="d-flex justify-center mt-5">
          <v-btn
            @click="$router.push({ name: 'home' })"
            color="#6c63ff"
            dark
            class="text-capitalize"
          >
            Seguir Comprando
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-else justify="center">
        <v-col cols="12" sm="12" md="4">
          <v-img contain src="../../assets/img/notificationBad.svg"></v-img>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row justify="center">
        <v-col cols="12" sm="12" md="4" class="d-flex justify-center mt-5">
          <v-progress-circular
            size="300"
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import Swal from "sweetalert2";
import {
  cleanPrice,
  trackStandard,
  trackCustom,
  EDIFIER_STORE_ID
} from "@/utils/metaPixel";
import { pushEcommerce, CURRENCY } from "@/utils/googleAnalytics";

export default {
  data() {
    return {
      loadingAutorize: false,
      isValid: false,
      messageNotification: ""
    };
  },

  created() {
    if (window !== window.top || window.name === "MP-Checkout") {
      const status = this.$route.query?.status;
      const resultData = {
        type: "mp-checkout-result",
        success: status === "approved" || status === "pending",
        query: this.$route.query
      };

      this.postMessageToParent(resultData);
      return;
    }

    if (this.$route.query?.preference_id) {
      this.HandlerGetAutorize();
    }
    trackCustom("CheckoutNotificationView");
  },

  methods: {
    firePurchasePixel(answerData) {
      try {
        const query = this.$route.query || {};
        const meta = (answerData && answerData.meta_pixel) || {};

        const collectionStatus =
          meta.collection_status || query.collection_status || query.status;
        if (collectionStatus !== "approved") return;

        const paymentId = meta.payment_id || query.payment_id;
        if (!paymentId) return;

        const storeId = meta.store_id;
        if (storeId != null && Number(storeId) !== EDIFIER_STORE_ID) return;

        const value = cleanPrice(meta.total_amount);
        if (!value) return;

        const externalReference =
          meta.external_reference || query.external_reference;
        const paymentType = query.payment_type || "unknown";

        // --- Meta Pixel (Path A) -------------------------------------------
        const metaDedupKey = "meta_purchase_fired_" + String(paymentId);
        let metaAlreadyFired = false;
        try {
          metaAlreadyFired = !!window.sessionStorage.getItem(metaDedupKey);
        } catch (e) {
          // ignore storage errors
        }

        if (!metaAlreadyFired) {
          const eventID = "purchase_" + String(paymentId);
          const payload = {
            value,
            content_type: "product",
            order_id: String(paymentId)
          };
          if (externalReference) {
            payload.external_reference = String(externalReference);
          }
          if (Array.isArray(meta.content_ids) && meta.content_ids.length) {
            payload.content_ids = meta.content_ids.map(String);
          }
          if (meta.num_items != null) {
            payload.num_items = meta.num_items;
          }
          if (Array.isArray(meta.items) && meta.items.length) {
            payload.contents = meta.items.map(it => ({
              id: String(it.item_id || ''),
              quantity: Number(it.quantity) || 0,
              item_price: Number(it.price) || 0
            }));
          }

          trackStandard("Purchase", payload, { eventID });

          try {
            window.sessionStorage.setItem(metaDedupKey, String(Date.now()));
          } catch (e) {
            // ignore storage errors
          }
        }

        // --- Google (GA4 via dataLayer) (Path A) ---------------------------
        // Independent dedup key so a partial failure on one surface doesn't
        // suppress the other on retry.
        const googleDedupKey = "google_purchase_fired_" + String(paymentId);
        let googleAlreadyFired = false;
        try {
          googleAlreadyFired = !!window.sessionStorage.getItem(googleDedupKey);
        } catch (e) {
          // ignore storage errors
        }

        if (!googleAlreadyFired) {
          pushEcommerce("purchase", {
            transaction_id: String(externalReference || paymentId),
            value,
            currency: CURRENCY,
            payment_type: paymentType,
            items: Array.isArray(meta.items) ? meta.items : [],
            ...(meta.num_items != null ? { num_items: meta.num_items } : {})
          });

          try {
            window.sessionStorage.setItem(googleDedupKey, String(Date.now()));
          } catch (e) {
            // ignore storage errors
          }
        }
      } catch (error) {
        console.log("firePurchasePixel error", error);
      }
    },

    postMessageToParent(payload) {
      try {
        window.parent?.postMessage(payload, "*");
      } catch (error) {
        console.log("checkout-notification-postmessage", error);
      }
    },

    async HandlerGetAutorize() {
      try {
        this.loadingAutorize = true;
        const request = this.$route.query;
        const response = await this.$store.dispatch(
          "products/GET_ANSWER",
          request
        );

        if (response.data.message == "approved") {
          this.isValid = true;
          this.messageNotification =
            "<p>Enviamos un email con la factura y detalles de la operacion</p><p style='margin-top:5px'>En 24hs habiles vas a recibir un correo con los datos de envio.</p>";
          this.firePurchasePixel(response.data);
          this.$store.commit("cart/CLEAN_CART");
          localStorage.removeItem("guest_cart");
          localStorage.removeItem("pending_checkout_cart_id");
          this.notifyParent("approved");
        } else {
          this.notifyParent(response.data.message);
          this.showMPError(response.data);
        }
      } catch (error) {
        this.postMessageToParent({
          type: "checkout-error",
          query: this.$route.query
        });
        this.notifyParent("error");
        Swal.fire({
          width: 550,
          icon: "warning",
          title: "Oh Oh ha ocurrido un error!",
          html: "<p>Ha ocurrido un error con tu compra por favor intenta de nuevo</p>",
          showConfirmButton: true,
          confirmButtonColor: "#80c35d",
          confirmButtonText: "Oki doki"
        });
      } finally {
        this.loadingAutorize = false;
      }
    },

    showMPError(response) {
      let messageTitle = "";
      let messageBody = "";
      const mpResponse = response.data.order.payment[0];
      switch (mpResponse.status_detail) {
        case "cc_rejected_insufficient_amount":
          messageTitle = "Pago Rechazado";
          messageBody = "Fondos insuficientes.";
          break;
        case "pending_contingency":
          messageTitle = "Pago pendiente";
          messageBody = `<p>Estamos procesando tu pago.</p>
          <p>No te preocupes, menos de 2 dias habiles te avisaremos por e-mail si se acredito.</p>`;
          break;
        case "pending_review_manual":
          messageTitle = "Pago pendiente";
          messageBody = `<p>Estamos procesando tu pago.</p>
          <p>No te preocupes, menos de 2 dias habiles te avisaremos por e-mail si se acredito o si necesitamos mas informacion.</p>`;
          break;
        case "cc_rejected_bad_filled_card_number":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>Revisa el numero de tarjeta.</p>";
          break;
        case "cc_rejected_bad_filled_date":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>Revisa la fecha de vencimiento.</p>";
          break;
        case "cc_rejected_bad_filled_other":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>Revisa los datos.</p>";
          break;
        case "cc_rejected_bad_filled_security_code":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>Revisa el codigo de seguridad de la tarjeta.</p>";
          break;
        case "cc_rejected_blacklist":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>No pudimos procesar tu pago.</p>";
          break;
        case "cc_rejected_call_for_authorize":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>Debes autorizar ante el metodo de pago.</p>";
          break;
        case "cc_rejected_card_disabled":
          messageTitle = "Pago Rechazado.";
          messageBody = `<p>Llama a tu metodo de pago para activar tu tarjeta o usa otro medio de pago.</p>
          <p>El telefono esta al dorso de tu tarjeta.</p>`;
          break;
        case "cc_rejected_card_error":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>No pudimos procesar tu pago.</p>";
          break;
        case "cc_rejected_duplicated_payment":
          messageTitle = "Pago Rechazado.";
          messageBody = `<p>Ya hiciste un pago por ese valor.</p>
          <p>Si necesitas volver a pagar usa otra tarjeta u otro medio de pago.</p>`;
          break;
        case "cc_rejected_high_risk":
          messageTitle = "Pago Rechazado.";
          messageBody = `<p>Tu pago fue rechazado.</p>
          <p>Elige otro de los medios de pago, te recomendamos con medios en efectivo.</p>`;
          break;
        case "cc_rejected_invalid_installments":
          messageTitle = "Pago Rechazado.";
          messageBody = `<p>El metodo de pago no procesa pagos en ${mpResponse.installment} cuotas.</p>
          <p>Elige otro de los medios de pago, te recomendamos con medios en efectivo.</p>`;
          break;
        case "cc_rejected_max_attempts":
          messageTitle = "Pago Rechazado.";
          messageBody = `<p>Llegaste al limite de intentos permitidos.</p>
          <p>Elige otra tarjeta u otro medio de pago.</p>`;
          break;
        case "cc_rejected_other_reason":
          messageTitle = "Pago Rechazado.";
          messageBody = "<p>No se proceso el pago.</p>";
          break;
      }
      Swal.fire({
        width: 600,
        icon: "error",
        title: messageTitle,
        html: messageBody,
        showConfirmButton: true,
        confirmButtonColor: "#80c35d"
      });
    },

    notifyParent(status) {
      const resultData = {
        type: "mp-checkout-result",
        status,
        success: status === "approved",
        query: this.$route.query
      };

      try {
        localStorage.setItem("checkout_completed", JSON.stringify(resultData));
      } catch (error) {
        console.log("localStorage error", error);
      }

      this.postMessageToParent(resultData);

      if (status === "approved" && window.opener) {
        setTimeout(() => {}, 2000);
      }
    }
  }
};
</script>

<style>
</style>
