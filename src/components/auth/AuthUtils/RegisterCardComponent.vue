<template>
  <v-card
    class="animate__animated animate__backInUp"
    width="600"
    flat
    style="
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
      border-radius: 20px !important;
    "
  >
    <div
      class="text-center mt-3 mb-4 px-4"
      style="font-size: 0.9em; font-weight: 400; line-height: 1.4rem; color: #555;"
    >
      Completa la información de facturación para registrar tu cuenta y recibir tu compra
    </div>

    <!-- Checkbox para usar info de envío -->
    <div v-if="showShippingCheckbox" class="px-6 mb-3">
      <v-checkbox
        v-model="useShippingInfo"
        label="Usar información de envío para facturación"
        color="#00A0E9"
        hide-details
        dense
        class="mt-0"
        :disabled="!shippingData || !shippingData.contact_name"
        @change="handleUseShippingInfo"
      ></v-checkbox>
      <div v-if="!shippingData || !shippingData.contact_name" class="caption grey--text mt-1 ml-8">
        Completa primero la dirección de envío
      </div>
    </div>

    <ValidationObserver ref="obsReg" v-slot="{ passes }">
      <v-row>
        <v-col cols="12" md="6" class="mt-2">
          <label
            style="color: #666666"
            class="font-weight-bold ml-3"
            for="nombre"
            >Nombre</label
          >
          <ValidationProvider
            name="nombre"
            rules="required"
            v-slot="{ errors }"
          >
            <v-text-field
              v-model="first_name"
              class="mt-2 pl-3 pr-3 px-sm-3 pr-md-0"
              color="black"
              dense
              filled
              flat
              placeholder="Ingresa tu nombre"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <label
            style="color: #666666"
            class="font-weight-bold ml-3 ml-md-0"
            for="apellido"
            >Apellido</label
          >
          <ValidationProvider
            name="apellido"
            rules="required"
            v-slot="{ errors }"
          >
            <v-text-field
              v-model="last_name"
              class="mt-2 ml-3 ml-sm-3 ml-md-0 pr-3"
              color="black"
              dense
              filled
              flat
              placeholder="Ingresa tu apellido"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <ValidationProvider
            name="correo"
            rules="email|required|confirmed:email_confirmation"
            v-slot="{ errors }"
          >
            <label style="color: #666666" class="font-weight-bold ml-3" for="email">
              Correo Electrónico
            </label>
            <v-text-field
              autocomplete="off"
              v-model="email"
              class="mt-2 pl-3 pr-3 px-sm-3 pr-md-0"
              color="black"
              dense
              filled
              flat
              placeholder="Ingresa tu correo electronico"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <ValidationProvider
            name="confirmar correo"
            rules="email|required"
            v-slot="{ errors }"
            vid="email_confirmation"
          >
            <label
              style="color: #666666"
              class="font-weight-bold ml-3 ml-md-0"
              for="email confirmar"
            >
              Confirmar Correo
            </label>
            <v-text-field
              autocomplete="off"
              v-model="email_confirmation"
              class="mt-2 ml-3 ml-sm-3 ml-md-0 pr-3"
              color="black"
              dense
              filled
              flat
              placeholder="Confirma tu correo electronico"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <ValidationProvider
            name="contraseña"
            rules="required|confirmed:confirmation"
            v-slot="{ errors }"
          >
            <label
              style="color: #666666"
              class="font-weight-bold ml-3"
              for="password"
            >
              Contraseña
            </label>
            <v-text-field
              autocomplete="off"
              v-model="password"
              type="password"
              class="mt-2 pl-3 pr-3 px-sm-3 pr-md-0"
              color="black"
              dense
              filled
              flat
              placeholder="Ingresa tu contraseña"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <ValidationProvider
            name="confirmar contraseña"
            rules="required"
            vid="confirmation"
            v-slot="{ errors }"
          >
            <label
              style="color: #666666"
              class="font-weight-bold ml-3 ml-md-0"
              for="password confirmar"
            >
              Confirmar Contraseña
            </label>
            <v-text-field
              autocomplete="off"
              v-model="confirm_password"
              type="password"
              class="mt-2 ml-3 ml-sm-3 ml-md-0 pr-3"
              color="black"
              dense
              filled
              flat
              placeholder="Confirma tu contraseña"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <label
            style="color: #666666"
            class="font-weight-bold ml-3"
            for="Codigo Postal"
          >
            Codigo Postal
          </label>
          <ValidationProvider
            name="codigo postal"
            rules="required|min:4|max:4|numeric"
            v-slot="{ errors }"
          >
            <v-text-field
              v-model="postal_code"
              class="mt-2 pl-3 pr-3 px-sm-3 pr-md-0"
              color="black"
              dense
              filled
              flat
              placeholder="Ingresa tu codigo postal"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <label
            style="color: #666666"
            class="font-weight-bold ml-3 ml-md-0"
            for="dni"
          >
            DNI / CUIT / CUIL
          </label>
          <ValidationProvider
            name="DNI"
            rules="required|numeric|min:7"
            v-slot="{ errors }"
          >
            <v-text-field
              v-model="doc_number"
              class="mt-2 ml-3 ml-sm-3 ml-md-0 pr-3"
              color="black"
              dense
              filled
              flat
              placeholder="Sin puntos ni guiones"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6" class="mt-2">
          <label
            style="color: #666666"
            class="font-weight-bold ml-3"
            for="telefono"
          >
            Teléfono
          </label>
          <ValidationProvider
            name="telefono"
            rules="required|numeric|min:8"
            v-slot="{ errors }"
          >
            <v-text-field
              v-model="phone"
              class="mt-2 pl-3 pr-3 px-sm-3 pr-md-0"
              color="black"
              dense
              filled
              flat
              placeholder="Ej: 1112345678"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="12">
          <div class="mx-3">
            <v-btn
              block
              :loading="loading"
              @click="passes(HandlerSignUp)"
              tile
              large
              elevation="0"
              dark
              color="#00A0E9"
              class="text-capitalize"
            >
              Registrar
            </v-btn>
          </div>
        </v-col>
        <v-col class="text-center mt-n7 mt-md-n5" cols="12" sm="12" md="12">
          <div
            @click="emitEvent"
            style="cursor: pointer"
            class="mt-6 mb-4 blue--text"
          >
            Ya tienes cuenta? Inicia sesion
          </div>
        </v-col>
      </v-row>
    </ValidationObserver>
  </v-card>
</template>

<script>
import { trackStandard } from "@/utils/metaPixel";

export default {
  props: {
    shippingData: {
      type: Object,
      default: () => null
    },
    showShippingCheckbox: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      useShippingInfo: false,
      //Register
      doc_type: "DNI",
      doc_number: "",
      store_id: 3,
      country_id: 1,
      phone: "",
      email: "",
      email_confirmation: "",
      first_name: "",
      postal_code: "",
      last_name: "",
      password: "",
      confirm_password: "",
    };
  },

  methods: {
    async HandlerSignUp() {
      try {
        this.loading = true;
        const request = {
          doc_type: this.doc_type,
          doc_number: this.doc_number,
          store_id: 3,
          country_id: 1,
          state_id: 1,
          phone: this.phone,
          email: this.email,
          first_name: this.first_name,
          last_name: this.last_name,
          billing_zip_code: this.postal_code,
          password: this.password,
        };
        await this.$store.dispatch("auth/REGISTER", request);
        
        // Auto-login después de registro exitoso
        try {
          const loginRequest = {
            email: this.email,
            password: this.password,
            store: 3
          };
          await this.$store.dispatch("auth/LOGIN", loginRequest);
          
          // Actualizar perfil con datos adicionales (DNI, teléfono, etc.)
          try {
            const profilePayload = {
              fullname: `${this.first_name} ${this.last_name}`,
              doc_type: 'DNI',
              doc_number: this.doc_number,
              phone: this.phone,
              email: this.email,
              billing_email: this.email,
              first_name: this.first_name,
              last_name: this.last_name,
              store_id: 3,
              contact_phone: this.phone,
            };
            await this.$store.dispatch("auth/UPDATE_PROFILE", profilePayload);
            console.log(">>> Perfil actualizado con datos adicionales");
          } catch (profileError) {
            console.log("Error actualizando perfil:", profileError);
            // No bloquear el flujo si falla la actualización del perfil
          }
          
          this.$snotify.success("Cuenta creada exitosamente", "¡Bienvenido!");
          trackStandard(
            "CompleteRegistration",
            {
              status: true,
              content_name: "buyer_account"
            },
            { includeCurrency: false }
          );
          console.log(">>> RegisterCardComponent: Emitiendo register:success");
          this.$emit("register:success"); // Nuevo evento para indicar registro+login exitoso
        } catch (loginError) {
          // Si falla el auto-login, mostrar mensaje y cambiar a login
          this.$snotify.info("Cuenta creada. Por favor inicia sesión.", "Info");
          this.emitEvent();
        }
      } catch (error) {
        console.log(error);
        this.$snotify.error(error.response.data.error.err_message, "Error!");
      } finally {
        this.loading = false;
      }
    },

    emitEvent() {
      this.$emit("register:change");
    },

    emitVerification() {
      const user = {
        email: this.email,
        password: this.password,
      };
      this.$emit("verification:change", user);
    },

    handleUseShippingInfo(checked) {
      if (checked && this.shippingData) {
        // Copiar nombre de quien recibe
        if (this.shippingData.contact_name) {
          const nameParts = this.shippingData.contact_name.split(' ');
          this.first_name = nameParts[0] || '';
          this.last_name = nameParts.slice(1).join(' ') || '';
        }
        // Copiar código postal
        if (this.shippingData.zipcode) {
          this.postal_code = this.shippingData.zipcode;
        }
        // Copiar teléfono
        if (this.shippingData.contact_phone) {
          this.phone = this.shippingData.contact_phone;
        }
      }
    },
  },
};
</script>

<style>
</style>
