<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="12">
        <navegtion-component
          title="REGISTRA TU CUENTA"
          sub_title="REGISTRA TU CUENTA"
        />
      </v-col>
      <!-- <v-col cols="12" md="12">
        <h1 class="text-center text-md-start font-weight-bold text-uppercase">
          Crea tu cuenta en STADIO
        </h1>
      </v-col> -->
    </v-row>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-row justify="center" class="mt-10">
        <v-col cols="12" md="8" class="my-10">
          <v-card
            class="py-5 px-5"
            flat
            style="
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
              border-radius: 20px !important;
            "
          >
            <v-row>
              <v-col class="text-center" cols="12">
                <v-avatar tile size="200">
                  <v-img src="@/assets/img/logo.svg" contain></v-img>
                </v-avatar>
                <v-divider class="my-5"></v-divider>
              </v-col>
              <v-col cols="12" md="6" class="mt-md-n5">
                <label for="nombre">Nombre</label>
                <ValidationProvider
                  name="nombre"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <v-text-field
                    v-model="first_name"
                    class="mt-2"
                    color="black"
                    dense
                    outlined
                    placeholder="Ingresa tu nombre"
                    :error-messages="errors"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col cols="12" md="6" class="mt-md-n5">
                <label for="Codigo Postal">Codigo Postal</label>
                <ValidationProvider
                  name="codigo postal"
                  rules="required|min:4|max:4|numeric"
                  v-slot="{ errors }"
                >
                  <v-text-field
                    v-model="postal_code"
                    class="mt-2"
                    color="black"
                    dense
                    outlined
                    placeholder="Ingresa tu codigo postal"
                    :error-messages="errors"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col cols="12" md="6" class="mt-md-n5">
                <ValidationProvider
                  name="correo"
                  rules="email|required|confirmed:email_confirmation"
                  v-slot="{ errors }"
                >
                  <label for="email"> Correo Electrónico </label>
                  <v-text-field
                    autocomplete="off"
                    v-model="email"
                    class="mt-2"
                    color="black"
                    dense
                    outlined
                    placeholder="Ingresa tu correo electronico"
                    :error-messages="errors"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col cols="12" md="6" class="mt-md-n5">
                <ValidationProvider
                  name="confirmar correo"
                  rules="email|required"
                  v-slot="{ errors }"
                  vid="email_confirmation"
                >
                  <label for="email confirmar"> Confirmar Correo </label>
                  <v-text-field
                    autocomplete="off"
                    v-model="email_confirmation"
                    class="mt-2"
                    color="black"
                    dense
                    outlined
                    placeholder="Confrima tu correo electronico"
                    :error-messages="errors"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col cols="12" md="6" class="mt-md-n5">
                <ValidationProvider
                  name="contraseña"
                  rules="required|confirmed:confirmation"
                  v-slot="{ errors }"
                >
                  <label for="password"> Contraseña </label>
                  <v-text-field
                    autocomplete="off"
                    v-model="password"
                    type="password"
                    class="mt-2"
                    color="black"
                    dense
                    outlined
                    placeholder="Ingresa tu contraseña"
                    :error-messages="errors"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col cols="12" md="6" class="mt-md-n5">
                <ValidationProvider
                  name="confirmar contraseña"
                  rules="required"
                  vid="confirmation"
                  v-slot="{ errors }"
                >
                  <label for="password confirmar"> Confirmar Contraseña </label>
                  <v-text-field
                    autocomplete="off"
                    v-model="confirm_password"
                    type="password"
                    class="mt-2"
                    color="black"
                    dense
                    outlined
                    placeholder="Confirma tu nombre contraseña"
                    :error-messages="errors"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col cols="12" md="12">
                <div class="d-md-flex justify-md-space-between">
                  <div class="d-flex justify-center">
                    <v-btn
                      :loading="loading"
                      @click="passes(HandlerSignUp)"
                      tile
                      elevation="0"
                      large
                      dark
                      color="black"
                      class="text-capitalize"
                    >
                      Continuar
                    </v-btn>
                  </div>
                  <span
                    @click="HandlerRouter('login')"
                    style="cursor: pointer"
                    class="d-flex justify-center mt-2 blue--text"
                    >Ya tienes cuenta? Inicia sesion
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </ValidationObserver>
    <v-dialog v-model="showNotification" max-width="600" persistent>
      <v-card>
        <v-card-title> Confirma tu cuenta para continuar </v-card-title>
        <v-card-text>
          <p class="mb-0 mt-10 black--text">
            Se ha enviado un correo para confirmar su cuenta, porfavor copie el
            codigo en el mismo e inicie sesion para validar.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            dark
            color="black"
            tile
            @click="$router.push({ name: 'login' })"
          >
            Continuar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import NavegationComponent from "@/components/Utils/navegation_component";
import { trackStandard } from "@/utils/metaPixel";
export default {
  components: {
    "navegtion-component": NavegationComponent,
  },
  data() {
    return {
      loading: false,
      showNotification: false,
      doc_type: "",
      doc_number: "",
      store_id: "",
      country_id: "",
      phone: "",
      email: "",
      email_confirmation: "",
      first_name: "",
      postal_code: "",
      last_name: "",
      password: "",
      confirm_password: "",

      //Locations
      dataRegion: [
        {
          name: "CABA",
          id: 1,
        },
        {
          name: "GBA",
          id: 5,
        },
        {
          name: "Rosario",
          id: 10,
        },
        {
          name: "Cordoba Capital",
          id: 3,
        },
      ],
      stateData: [],
      state_id: "",
      location_id: "",
      warehouse_id: "",
    };
  },

  created() {
    this.HandlerGetState();

    window.fbq("trackCustom", "SignUpView");
  },

  methods: {
    HandlerRouter(router) {
      this.$router.push({ name: router });
    },

    async HandlerGetState() {
      try {
        this.loadingState = true;
        const request = { country_id: 1 };
        const response = await this.$store.dispatch(
          "products/GET_STATE",
          request
        );
        this.stateData = response.data.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingState = false;
      }
    },

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
          state_id: this.state_id.id,
          location_id: this.location_id,
          warehouse_id: this.warehouse_id,
          billing_zip_code: this.postal_code,
          password: this.password,
        };
        await this.$store.dispatch("auth/REGISTER", request);
        trackStandard(
          "CompleteRegistration",
          {
            status: true,
            content_name: "buyer_account"
          },
          { includeCurrency: false }
        );
        this.showNotification = true;
        // this.$router.push({ name: "login" });
      } catch (error) {
        console.log(error.response.data);

        this.$snotify.error(error.response.data.error.err_message, "Error!");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style>
</style>
