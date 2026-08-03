<template>
  <div class="d-flex flex-column" style=" overflow: hidden; background-color: #F8F9FA;">
    <v-container class="d-flex flex-column pa-0" style="max-width: 1000px; height: 100%;">
      
      <div class="d-flex flex-column align-center pt-4 pb-2 flex-shrink-0">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-3 mb-1" style="letter-spacing: 0.5px;">
          Lista de Compra
        </h1>
        <div class="primary-underline"></div>
      </div>

      <v-stepper v-model="e1" alt-labels class="elevation-0 bg-transparent d-flex flex-column flex-grow-1 overflow-hidden">
        <v-stepper-header class="elevation-0 bg-transparent mb-2 flex-shrink-0" style="height: auto;">
          <v-stepper-step :complete="e1 > 1" step="1" color="#00A0E9" class="py-2">
            <span :class="{'font-weight-bold text-primary': e1 === 1}" style="font-size: 0.8rem;">Carrito</span>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="e1 > paymentStep"
            :step="paymentStep"
            color="#00A0E9"
            class="py-2"
          >
            <span :class="{'font-weight-bold text-primary': e1 === paymentStep}" style="font-size: 0.8rem;">Forma de pago</span>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="e1 > deliveryStep"
            :step="deliveryStep"
            color="#00A0E9"
            class="py-2"
          >
            <span :class="{'font-weight-bold text-primary': e1 === deliveryStep}" style="font-size: 0.8rem;">Envío</span>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="e1 > accountStep || isAuth"
            :step="accountStep"
            color="#00A0E9"
            class="py-2"
          >
            <span :class="{'font-weight-bold text-primary': e1 === accountStep}" style="font-size: 0.8rem;">Cuenta</span>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="e1 > checkoutStep"
            :step="checkoutStep"
            color="#00A0E9"
            class="py-2"
          >
            <span :class="{'font-weight-bold text-primary': e1 === checkoutStep}" style="font-size: 0.8rem;">Checkout</span>
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items class="flex-grow-1 overflow-hidden relative">
          <v-stepper-content step="1" class="pa-0 fill-height">
            <div class="d-flex flex-column fill-height overflow-hidden">
            <v-card class="rounded-lg elevation-0 flex-grow-1 d-flex flex-column overflow-hidden white">
              <v-card-text class="pa-0 flex-grow-1 overflow-hidden">
                <v-row no-gutters class="fill-height">
                  <v-col cols="12" class="pa-0 fill-height">
                    <table-items :products="productCartState.shopping_cart_items" />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions class="pa-3 grey lighten-5 d-flex justify-space-between align-center flex-shrink-0">
                  <v-btn
                    text
                    small
                    color="grey darken-1"
                    @click="$router.go(-1)"
                    class="text-capitalize"
                  >
                    <v-icon left small>mdi-arrow-left</v-icon>
                    Volver
                  </v-btn>

                  <div class="d-flex align-center">
                      <div class="mr-4 text-right" v-if="productCartState.shopping_cart_items.length > 0">
                          <span class="text-caption grey--text text--darken-1 d-block" style="line-height: 1;">Subtotal</span>
                          <span class="text-subtitle-1 font-weight-bold black--text">
                               ${{ totalPriceOnePayment(productCartState.shopping_cart_items) | currency }}
                          </span>
                      </div>
                      <v-btn
                        rounded
                        color="#00A0E9"
                        class="white--text px-6 text-capitalize font-weight-bold shadow-blue"
                        @click="goToNextFromCart"
                        :disabled="productCartState.shopping_cart_items.length === 0"
                        small
                      >
                        Siguiente
                        <v-icon right small>mdi-arrow-right</v-icon>
                      </v-btn>
                  </div>
              </v-card-actions>
            </v-card>
            </div>
          </v-stepper-content>

          <v-stepper-content :step="accountStep" class="pa-0 fill-height">
            <div class="d-flex flex-column fill-height overflow-auto custom-scrollbar">
              <v-row justify="center" class="ma-0">
                <v-col cols="12" md="10" lg="8" class="pa-0">
                  <v-card class="rounded-lg elevation-0 mt-1 white">
                    <div class="text-center pt-4 pb-1">
                      <h2 class="text-subtitle-1 font-weight-bold grey--text text--darken-3">Cuenta</h2>
                      <p class="caption grey--text mb-1">
                        <span v-if="!isAuth"></span>
                        <span v-else>Ya iniciaste sesión. Finalizá tu compra.</span>
                      </p>
                    </div>

                    <v-card-text class="px-4 py-2">
                      <!-- Mostrar formulario de registro si no está logueado -->
                      <div class="d-flex justify-center" v-if="!isAuth">
                        <login-card-component
                          v-if="showLoginCard"
                          :redirectOnLogin="false"
                          :emailUser="email"
                          :passwordUser="password"
                          @login:change="toggleAuthCard"
                          @recovery:change="toggleRecovery"
                          @login:success="handleLoginSuccess"
                        />
                        <register-card-component
                          v-else
                          :shippingData="currentShippingData"
                          :showShippingCheckbox="radioGroup === 1"
                          @register:change="toggleAuthCard"
                          @register:success="handleRegisterSuccess"
                        />
                      </div>

                      <!-- Si ya está logueado con cuenta real, mostrar mensaje y botón -->
                      <div v-else class="d-flex flex-column align-center py-4">
                        <v-icon color="#00A0E9" size="36" class="mb-2">mdi-account-check-outline</v-icon>
                        <p class="text-subtitle-2 font-weight-medium grey--text text--darken-3 mb-1">Sesión iniciada</p>
                        <p class="caption grey--text text-center mb-0">Todo listo para finalizar tu compra.</p>
                      </div>
                    </v-card-text>

                    <v-card-actions class="px-4 pb-4 pt-0 justify-space-between">
                      <v-btn text small color="grey darken-1" @click="e1 = deliveryStep" class="text-capitalize">
                        <v-icon left small>mdi-arrow-left</v-icon> Atrás
                      </v-btn>
                      <v-btn
                        :disabled="!isAuth"
                        :loading="loadingCheckout"
                        color="#00A0E9"
                        class="white--text px-6 shadow-blue"
                        rounded
                        small
                        @click="e1 = checkoutStep"
                      >
                        Continuar
                        <v-icon right small>mdi-arrow-right</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <v-dialog v-model="showRecovery" max-width="500">
              <ValidationObserver ref="obsRec" v-slot="{ passes }">
                <v-card
                  class="animate__animated animate__fadeIn animate__faster"
                  :loading="loading_verification"
                  v-if="!showNotificationEmail"
                >
                  <v-card-title>
                    Ingresa tu correo para recuperar tu cuenta
                  </v-card-title>
                  <v-card-text class="mt-2 mb-0 pb-0">
                    <ValidationProvider
                      name="correo"
                      rules="required|email"
                      v-slot="{ errors }"
                    >
                      <v-text-field
                        @keyup.enter="passes(HandlerRecoveryAccount)"
                        v-model="email_verifiction"
                        label="Correo Electrónico"
                        dense
                        filled
                        color="#00A0E9"
                        :error-messages="errors"
                      ></v-text-field>
                    </ValidationProvider>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      :loading="loading_verification"
                      @click="showRecovery = false"
                      dark
                      color="grey darken-3"
                      text
                    >
                      Cancelar
                    </v-btn>
                    <v-btn
                      color="#00A0E9"
                      :loading="loading_verification"
                      @click="passes(HandlerRecoveryAccount)"
                      dark
                      rounded
                    >
                      Recuperar
                    </v-btn>
                  </v-card-actions>
                </v-card>
                <v-card
                  v-else
                  class="animate__animated animate__fadeIn animate__faster"
                >
                  <v-card-text>
                    <v-alert
                      class="pt-7"
                      icon="mdi-check-outline"
                      prominent
                      text
                      type="success"
                    >
                      Se ha enviado un correo para que modifique su contraseña
                    </v-alert>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="() => {
                      showRecovery = false;
                      showNotificationEmail = false;
                      email_verifiction = '';
                    }">Ok</v-btn>
                  </v-card-actions>
                </v-card>
              </ValidationObserver>
            </v-dialog>
          </v-stepper-content>

          <v-stepper-content :step="paymentStep" class="pa-0 fill-height">
            <div class="d-flex flex-column fill-height overflow-hidden">
            <v-row justify="center" class="fill-height ma-0 overflow-auto custom-scrollbar">
              <v-col cols="12" md="10" lg="8" class="pa-0">
                <v-card class="rounded-lg elevation-0 mt-1 white">
                  <div class="text-center pt-4 pb-1">
                      <h2 class="text-subtitle-1 font-weight-bold grey--text text--darken-3">Forma de pago</h2>
                  </div>
                  
                  <v-card-text class="px-4 py-2">
                    <v-row dense>
                      <v-col cols="12" sm="4" class="d-flex pa-1">
                        <v-card
                          outlined
                          class="flex-grow-1 payment-card d-flex flex-column align-center justify-center pa-3 transition-swing"
                          :class="{'selected-payment-card': radioGroupDues === 0}"
                          @click="checkoutType(1)"
                          ripple
                        >
                          <v-icon :color="radioGroupDues === 0 ? '#00A0E9' : 'grey lighten-1'" class="mb-1">mdi-credit-card-clock-outline</v-icon>
                          <span class="text-body-2 font-weight-bold black--text">6 Cuotas</span>
                          <span class="caption grey--text text-center" style="font-size: 0.7rem;">Fijas</span>
                                                     <span class="text-body-2 font-weight-bold black--text text-center" style="line-height: 1.1;"><span style="font-size: 0.6rem; color: #666">(vía Mercado Pago)</span></span>

                        </v-card>
                      </v-col>

                      <v-col cols="12" sm="4" class="d-flex pa-1">
                        <v-card
                          outlined
                          class="flex-grow-1 payment-card d-flex flex-column align-center justify-center pa-3 transition-swing"
                          :class="{'selected-payment-card': radioGroupCredit === 0}"
                          @click="checkoutType(2)"
                          ripple
                        >
                           <v-icon :color="radioGroupCredit === 0 ? '#00A0E9' : 'grey lighten-1'" class="mb-1">mdi-credit-card-outline</v-icon>
                           <span class="text-body-2 font-weight-bold black--text text-center" style="line-height: 1.1;">Tarjetas / Dinero en cuenta <br><span style="font-size: 0.6rem; color: #666">(vía Mercado Pago)</span></span>
                           <span class="caption grey--text text-center" style="font-size: 0.7rem;"></span>
                        </v-card>
                      </v-col>

                      <v-col cols="12" sm="4" class="d-flex pa-1">
                        <v-card
                          outlined
                          class="flex-grow-1 payment-card d-flex flex-column align-center justify-center pa-3 transition-swing"
                          :class="{'selected-payment-card': radioGroupTransfer === 0}"
                          @click="checkoutType(3)"
                          ripple
                        >
                            <v-icon :color="radioGroupTransfer === 0 ? '#00A0E9' : 'grey lighten-1'" class="mb-1">mdi-bank-transfer</v-icon>
                            <span class="text-body-2 font-weight-bold black--text text-center">Transferencia <br><span style="font-size: 0.7rem; color: #4CAF50;">(Desc. Bancario)</span></span>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>
                    
                    <div class="d-flex justify-space-between align-center px-3 py-2 grey lighten-5 rounded">
                      <span class="text-caption grey--text text--darken-2 font-weight-medium">Total</span>
                      <span class="text-subtitle-1 font-weight-black black--text">
                           ${{ (totalPrice(productCartState.shopping_cart_items) || totalAmount) | currency }}
                      </span>
                    </div>
                  </v-card-text>

                  <v-card-actions class="px-4 pb-4 pt-0 justify-space-between">
                       <v-btn text small color="grey darken-1" @click="goToPreviousFromPayment" class="text-capitalize">
                           <v-icon left small>mdi-arrow-left</v-icon> Atrás
                       </v-btn>
                       <v-btn
                          :disabled="radioGroupDues == null && radioGroupCredit == null && radioGroupTransfer == null"
                          color="#00A0E9"
                          class="white--text px-6 shadow-blue"
                          rounded
                          small
                          @click="canCheckoutStepper()"
                        >
                          Siguiente
                          <v-icon right small>mdi-arrow-right</v-icon>
                        </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            </div>
          </v-stepper-content>

          <v-stepper-content :step="deliveryStep" class="pa-0 fill-height">
            <div class="d-flex flex-column fill-height overflow-hidden">
             <v-row justify="center" class="fill-height ma-0 overflow-auto custom-scrollbar">
              <v-col cols="12" md="10" lg="8" class="pa-0">
                <v-card :loading="loadingCheckout" class="rounded-lg elevation-0 mt-1 white">
                  <div class="text-center pt-4 pb-1">
                      <h2 class="text-subtitle-1 font-weight-bold grey--text text--darken-3">Método de entrega</h2>
                  </div>

                  <v-card-text class="px-4 py-2">
                    <v-radio-group v-model="radioGroup" class="mt-0" hide-details>
                        <v-row dense class="mb-3">
                            <v-col cols="12" sm="6" class="pa-1">
                                <v-card
                                  outlined
                                  class="delivery-option-card pa-3 cursor-pointer transition-swing d-flex align-center"
                                  :class="{'selected-delivery-card': radioGroup === 0}"
                                  @click="selectDeliveryMethod(0)"
                                  ripple
                                >
                                    <div class="mr-3 rounded-circle blue lighten-5 pa-2 d-flex">
                                        <v-icon small color="#00A0E9">mdi-store</v-icon>
                                    </div>
                                    <div class="flex-grow-1">
                                        <div class="font-weight-bold text-body-2 black--text">Retiro en tienda</div>
                                        <div class="caption grey--text" style="line-height: 1;">Gratis</div>
                                    </div>
                                    <v-radio :value="0" color="#00A0E9" class="ma-0" @click.stop="selectDeliveryMethod(0)"></v-radio>
                                </v-card>
                            </v-col>
                            <v-col cols="12" sm="6" class="pa-1">
                                <v-card 
                                  outlined 
                                  class="delivery-option-card pa-3 cursor-pointer transition-swing d-flex align-center"
                                  :class="{'selected-delivery-card': radioGroup === 1}"
                                  @click="selectDeliveryMethod(1)"
                                  ripple
                                >
                                    <div class="mr-3 rounded-circle blue lighten-5 pa-2 d-flex">
                                        <v-icon small color="#00A0E9">mdi-truck-delivery</v-icon>
                                    </div>
                                    <div class="flex-grow-1">
                                        <div class="font-weight-bold text-body-2 black--text">Envío a domicilio</div>
                                        <div class="caption grey--text" style="line-height: 1;">Calculado en el checkout</div>
                                    </div>
                                    <v-radio :value="1" color="#00A0E9" class="ma-0" @click.stop="selectDeliveryMethod(1)"></v-radio>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-radio-group>

                    <v-expand-transition>
                        <div v-if="radioGroup !== null">
                            <div v-if="radioGroup == 0" class="details-container pa-3 rounded grey lighten-5 mb-2">
                               <div v-if="availableWharehouses.length > 0">
                                  <p class="font-weight-bold mb-2 text-caption black--text">Punto de retiro:</p>
                                  <v-radio-group v-model="selectedWharehouse" mandatory dense hide-details>
                                    <v-radio
                                      v-for="n in availableWharehouses"
                                      :key="n.id"
                                      :label="`${depositElements[n.name]}`"
                                      :value="`${n.warehouse_id}`"
                                      color="#00A0E9"
                                      class="mb-1"
                                    >
                                      <template v-slot:label>
                                        <span class="text-caption font-weight-medium">{{depositElements[n.name]}}</span>
                                      </template>
                                    </v-radio>
                                  </v-radio-group>
                               </div>
                               <div v-else class="text-center py-2">
                                 <p class="error--text caption font-weight-medium ma-0">Sin stock en tiendas.</p>
                               </div>
                            </div>

                            <div v-if="radioGroup == 1" class="details-container pa-3 rounded grey lighten-5 mb-2">
                              <div v-if="userAddress.length > 0">
                                 <p class="font-weight-bold mb-2 text-caption black--text">Dirección de entrega:</p>
                                 <v-select
                                    @change="HandlerShippingQuote()"
                                    :items="userAddress"
                                    :item-text="item => `${item.street} ${item.street_number} - ${item.location}`"
                                    item-value="id"
                                    outlined
                                    dense
                                    background-color="white"
                                    placeholder="Elige una dirección"
                                    return-object
                                    v-model="idAddress"
                                    hide-details="auto"
                                    class="text-body-2"
                                  >
                                    <template v-slot:prepend-inner>
                                        <v-icon small color="#00A0E9">mdi-map-marker</v-icon>
                                    </template>
                                  </v-select>
                                  
                                  <div class="d-flex justify-end mt-1">
                                      <v-btn x-small text color="#00A0E9" @click="handleEditAddress" class="px-0">
                                          <v-icon left x-small>mdi-pencil</v-icon> Editar
                                      </v-btn>
                                  </div>
                              </div>
                              <div v-else>
                                 <cart-address-form ref="addressForm" @address-added="HandlerAddressAdded" />
                              </div>
                            </div>
                        </div>
                    </v-expand-transition>

                    <v-card flat outlined class="mt-3 rounded">
                        <v-card-text class="py-2 px-3">
                            <div class="d-flex justify-space-between mb-1">
                                <span class="grey--text text--darken-1 text-caption">Subtotal</span>
                                <span class="font-weight-medium black--text text-caption">
                                    ${{ totalPrice(productCartState.shopping_cart_items) | currency }}
                                </span>
                            </div>
                            <div class="d-flex justify-space-between mb-1" v-if="radioGroup === 1">
                                <span class="grey--text text--darken-1 text-caption">Envío</span>
                                <span class="font-weight-medium black--text text-caption" style="text-align: right; max-width: 60%;">
                                    <span v-if="shippingQuoteState === 'price'">${{ quote | currency }}</span>
                                    <span v-else-if="shippingQuoteState === 'free'" class="green--text text--darken-1 font-weight-medium">Gratis</span>
                                    <span v-else-if="shippingQuoteState === 'calculating'" class="grey--text">Calculando</span>
                                    <span v-else class="grey--text">Calculado en el checkout</span>
                                </span>
                            </div>
                            <v-divider class="my-1"></v-divider>
                            <div class="d-flex justify-space-between align-end">
                                <span class="text-body-2 font-weight-bold black--text">Total</span>
                                <span class="text-h6 font-weight-black blue--text text--darken-1">
                                    ${{ (totalPrice(productCartState.shopping_cart_items) + (radioGroup === 1 ? quote : 0)) | currency }}
                                </span>
                            </div>
                        </v-card-text>
                    </v-card>

                    <div v-if="errorGetQuoute" class="error--text text-center mt-2 caption" style="line-height: 1.2;">
                      No se pudo cotizar el envío. Verifica tu dirección.
                    </div>

                    <v-alert
                      v-if="radioGroup === 1 && quote === 0 && !loadingCheckout && !statusQuote"
                      dense
                      type="info"
                      text
                      class="mt-3 mb-0 caption d-flex align-center"
                    >
                      El costo de envío se calculará al finalizar.
                    </v-alert>

                  </v-card-text>
                  <v-card-actions class="px-4 pb-4 pt-0 justify-space-between">
                    <v-btn text small color="grey darken-1" @click="e1 = paymentStep" class="text-capitalize">
                        <v-icon left small>mdi-arrow-left</v-icon> Atrás
                    </v-btn>
                    <v-btn
                      rounded
                      small
                      :loading="loadingCheckout"
                      :disabled="isDeliveryNextDisabled"
                      @click="handleDeliveryNext()"
                      color="#14A7EB"
                      class="white--text px-6 shadow-blue text-capitalize font-weight-bold"
                    >
                      {{ isAuth ? 'Finalizar' : 'Siguiente' }}
                      <v-icon right small>{{ isAuth ? 'mdi-check' : 'mdi-arrow-right' }}</v-icon>
                    </v-btn>
                  </v-card-actions>
                  </v-card>
              </v-col>
             </v-row>
             </div>
          </v-stepper-content>

          <!-- PASO 5: CHECKOUT - Resumen final y pago -->
          <v-stepper-content :step="checkoutStep" class="pa-0 fill-height">
            <div class="d-flex flex-column fill-height overflow-auto custom-scrollbar">
              <v-row justify="center" class="ma-0">
                <v-col cols="12" md="10" lg="8" class="pa-0">
                  <v-card class="rounded-lg elevation-0 mt-1 white">
                    <div class="text-center pt-4 pb-1">
                      <h2 class="text-subtitle-1 font-weight-bold grey--text text--darken-3">Resumen de Compra</h2>
                      <p class="caption grey--text mb-1">Revisá los detalles antes de pagar</p>
                    </div>

                    <v-card-text class="px-4 py-2">
                      <!-- Resumen de productos -->
                      <div class="mb-3">
                        <p class="font-weight-bold text-caption black--text mb-2">Productos</p>
                        <div v-for="item in (productCartState.shopping_cart_items || [])" :key="item.id" class="mb-2">
                          <div class="d-flex justify-space-between">
                            <span class="text-caption grey--text text--darken-2">{{ item.publication?.keywords || 'Producto' }} x{{ item.original_quantity }}</span>
                            <span class="text-caption font-weight-medium">${{ (getItemDisplayPrice(item) * item.original_quantity) | currency }}</span>
                          </div>
                          <div v-if="item.publication?.sku || item.publication?.ean" class="text-caption grey--text" style="font-size: 0.7rem;">
                            Modelo: {{ item.publication?.sku || item.publication?.ean || '-' }}
                          </div>
                        </div>
                      </div>

                      <v-divider class="my-2"></v-divider>

                      <!-- Método de envío -->
                      <div class="d-flex justify-space-between mb-1">
                        <span class="text-caption grey--text">Método de envío</span>
                        <span class="text-caption font-weight-medium">{{ radioGroup === 0 ? 'Retiro en tienda' : 'Envío a domicilio' }}</span>
                      </div>

                      <!-- Costo de envío -->
                      <div class="d-flex justify-space-between mb-1" v-if="radioGroup === 1">
                        <span class="text-caption grey--text">Costo de envío</span>
                        <span class="text-caption font-weight-medium" v-if="shippingQuoteState === 'price'">${{ quote | currency }}</span>
                        <span class="text-caption font-weight-medium green--text text--darken-1" v-else-if="shippingQuoteState === 'free'">Gratis</span>
                        <span class="text-caption grey--text" v-else-if="shippingQuoteState === 'calculating'">Calculando</span>
                        <span class="text-caption grey--text" v-else>Calculado en el checkout</span>
                      </div>

                      <v-divider class="my-2"></v-divider>

                      <!-- Descuento -->
                      <div class="d-flex justify-space-between mb-1" v-if="radioGroupTransfer === 0">
                        <span class="text-caption green--text text--darken-2">Descuento Transferencia</span>
                        <span class="text-caption font-weight-medium green--text text--darken-2">
                          -${{ (totalPriceOnePayment(productCartState.shopping_cart_items) - totalPrice(productCartState.shopping_cart_items)) | currency }}
                        </span>
                      </div>
                      

                      <!-- Total -->
                      <div class="d-flex justify-space-between">
                        <span class="text-subtitle-2 font-weight-bold black--text">Total a pagar</span>
                        <span class="text-subtitle-1 font-weight-bold" style="color: #00A0E9;">
                          ${{ (totalPrice(productCartState.shopping_cart_items) + quote) | currency }}
                        </span>
                      </div>

                      <!-- Método de pago seleccionado -->
                      <div class="mt-4 pa-3 rounded grey lighten-4">
                        <p class="font-weight-bold text-caption black--text mb-1">Método de pago</p>
                        <span class="text-caption grey--text text--darken-2">
                          {{ paymentMethodDescription }}
                        </span>
                        <div class="text-caption grey--text mt-1" style="font-size: 0.7rem;">
                          <v-icon x-small color="grey">mdi-shield-check</v-icon>
                          Procesado por Mercado Pago
                        </div>
                      </div>
                    </v-card-text>

                    <v-card-actions class="px-4 pb-4 pt-0 justify-space-between">
                      <v-btn text small color="grey darken-1" @click="e1 = accountStep" class="text-capitalize">
                        <v-icon left small>mdi-arrow-left</v-icon> Atrás
                      </v-btn>
                      <v-btn
                        :loading="loadingCheckout"
                        :disabled="isCheckoutProceedDisabled"
                        color="#00A0E9"
                        class="white--text px-6 shadow-blue"
                        rounded
                        small
                        @click="HandlerProceedToPayment()"
                      >
                        Proceder al Pago
                        <v-icon right small>mdi-credit-card</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>

      <dialog-notification
        v-if="showAlertCheckout"
        :active="showAlertCheckout"
      >
        <acept-no-items
          :data="dataAlertCheckout"
          @dialog:change="HandlerCloseAcceptProduct"
        />
      </dialog-notification>

      <v-dialog
        v-model="showAlertPerfil"
        v-if="showAlertPerfil"
        max-width="600"
        persistent
      >
        <cart-profile-form
            :missingDetails="alertPerfil"
            @cancel="showAlertPerfil = false"
            @profile-updated="HandlerProfileUpdated"
        />
      </v-dialog>
      <v-dialog
        v-model="checkoutDialog"
        max-width="1100"
        scrollable
        persistent
      >
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center pr-2">
            <div class="d-flex align-center">
              <v-icon color="#00A0E9" left>mdi-credit-card</v-icon>
              <span class="font-weight-bold text-subtitle-1">Finaliza tu pago</span>
            </div>
            <v-btn icon @click="closeCheckoutDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider class="mb-0"></v-divider>
          <v-card-text class="pa-0">
            <div class="checkout-frame-wrapper">
              <iframe
                v-if="checkoutUrl"
                ref="checkoutFrame"
                class="checkout-frame"
                :src="checkoutUrl"
                @load="handleCheckoutFrameLoad"
                frameborder="0"
                allowfullscreen
                allow="payment; geolocation; microphone; camera; midi; encrypted-media"
                sandbox="allow-forms allow-modals allow-popups allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
              ></iframe>
              <div v-else class="d-flex align-center justify-center py-12">
                <v-progress-circular indeterminate color="#00A0E9"></v-progress-circular>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
    <transfer-checkout
      v-if="showModalTransfer"
      :showModalTransfer="showModalTransfer"
      :productCartState="productCartState"
      :responseTransferCheckout="responseTransferCheckout"
      :selectedAddress="idAddress"
    />
    <suscribe-component />
  </div>
</template>

<script>
import DialogNotification from "./DialogNotification";
import AceptNoItems from "./AceptNoItems";
import TableItems from "./utils/TableItems.vue";
import Suscribe from "../Utils/suscribe_component.vue";
import TransferCheckout from "./utils/TransferCheckout.vue";
import CartAddressForm from "./utils/CartAddressForm.vue";
import CartProfileForm from "./utils/CartProfileForm.vue";
import LoginCardComponent from "../auth/AuthUtils/loginCardComponent.vue";
import RegisterCardComponent from "../auth/AuthUtils/RegisterCardComponent.vue";
import {
  buildCheckoutUrl,
  buildMercadoPagoReturnConfig
} from "../../utils/checkout";
import { cleanPrice, trackStandard, trackCustom } from "../../utils/metaPixel";
import {
  pushEcommerce,
  buildItem,
  buildItems,
  CURRENCY
} from "../../utils/googleAnalytics";
import { getStoredClickIds } from "../../utils/googleAdsAttribution";
import { getShippingQuoteState } from "../../utils/purchaseState";

export default {
  components: {
    DialogNotification,
    AceptNoItems,
    TableItems,
    "suscribe-component": Suscribe,
    "transfer-checkout": TransferCheckout,
    "cart-address-form": CartAddressForm,
    "cart-profile-form": CartProfileForm,
    "login-card-component": LoginCardComponent,
    "register-card-component": RegisterCardComponent
  },
  data() {
    return {
      e1: 1,
      quote: 0,
      total_order: 0,
      errorGetQuoute: false,
      statusQuote: false,
      items: [],
      showAlertRemove: false,
      selectProduct: null,
      confirmOrder: [],
      showAlertCheckout: false,
      dataAlertCheckout: {},

      //Checkout
      radioGroup: null,
      retirementValue: "",
      userAddress: [],
      idAddress: null,
      loadingAcceptItem: false,
      loadingCheckout: false,
      loadingShippingQuote: false,
      showSelectDelivery: false,
      showAddressChange: false,
      depositElements: {
        FWL01: "CABA: Vieytes 1155/1149 Barracas. Lunes a Viernes de 9 a 13 hs y de 14 a 17 hs. (Solo retiro, presentar DNI)",
        ROS01: "Rosario",
        CBA01: "Córdoba Capital"
      },
      selectDeposit: "",
      dues: false,
      credit: false,
      transfer: false,
      radioGroupDues: null,
      radioGroupCredit: null,
      radioGroupTransfer: null,
      payments_type: "",
      default_installments: "",
      availableWharehouses: [],
      selectedWharehouse: "",

      showModalTransfer: false,

      // Notifiction Checkout
      alertNotificationBuy: false,
      canBuyWarehouse: null,

      // Checkout
      responseTransferCheckout: {},

      // Error Checkout
      showAlertPerfil: false,
      alertPerfil: [],

      loadingLocation: false,
      freeShipping: false,

      // Embedded checkout
      checkoutDialog: false,
      checkoutUrl: "",
      lastCheckoutFrameUrl: "",
      checkoutFrameCrossOriginLogged: false,

      // Inline auth flow
      showLoginCard: false,  // Mostrar registro directo en checkout
      showRecovery: false,
      showNotificationEmail: false,
      loading_verification: false,
      email_verifiction: "",
      email: "",
      password: "",

      // Polling para checkout en Safari/iOS (Dejado por compatibilidad pero no se usa en el modal)
      checkoutPollInterval: null,

      // Dirección temporal para guests (se sincroniza después del registro)
      guestAddress: null
    };
  },

  async created() {
    // Verificar si hay un checkout completado pendiente de procesar
    this.checkCompletedCheckout();
    
    // Si no hay token de usuario real, hacer login con guest para APIs
    if (!this.isAuth) {
      try {
        await this.$store.dispatch('auth/GUEST_LOGIN');
      } catch (error) {
        console.log('Error en guest login:', error);
      }
    }
    
    this.HandlerGetCartsProducts();
    if (this.isAuth) {
      this.HandlerGetAddress();
    }
    this.HandlerTrackCartView();
  },

  mounted() {
    window.addEventListener("message", this.handleCheckoutMessage);
    // Escuchar cambios en localStorage desde otras pestañas (Safari/iOS)
    window.addEventListener("storage", this.handleStorageChange);
  },

  beforeDestroy() {
    window.removeEventListener("message", this.handleCheckoutMessage);
    window.removeEventListener("storage", this.handleStorageChange);
    // Limpiar polling de checkout si existe
    if (this.checkoutPollInterval) {
      clearInterval(this.checkoutPollInterval);
    }
  },

    watch: {
    radioGroup(val) {
      console.log(val);
      // Ahora siempre hay auth (guest o real), validar warehouse normalmente
      if (val == 0) {
        this.ValidateProductWarehouse();
      }
    },
    async isAuth(val, oldVal) {
      if (val && oldVal === false) {
        // Usuario se logueó (login o registro) durante el checkout
        if (this.e1 === this.accountStep) {
          console.log(">>> isAuth watcher: Usuario logueado, ejecutando APIs");
          await this.restoreGuestSelectionsAndCheckout();
        }
      } else if (!val && oldVal === true) {
        // Usuario cerró sesión
        this.e1 = 1;
        this.userAddress = [];
        this.idAddress = null;
      }
    },
    e1(val) {
      // Guardar selecciones al llegar al paso de Cuenta (si no está logueado)
      if (val === this.accountStep && !this.isAuth) {
        this.saveGuestSelections();
      }
      
      if(val === this.deliveryStep) {
        // Las APIs de dirección solo se llaman cuando está logueado
        if (this.isAuth) {
          this.HandlerGetAddress();
          if (this.userAddress.length > 0 && this.radioGroup == 1) {
             this.getUserAddressPriority();
          }
          if (this.radioGroup == 0) {
             this.ValidateProductWarehouse();
          }
        }
      }
    }
  },

  computed: {
    // Orden: Carrito(1) -> Pago(2) -> Envío(3) -> Cuenta(4) -> Checkout(5)
    paymentStep() {
      return 2;
    },

    deliveryStep() {
      return 3;
    },

    accountStep() {
      return 4;
    },

    checkoutStep() {
      return 5;
    },

    isAuth() {
      return !!this.$store.state.auth.token;
    },

    productCartState() {
      return this.$store.getters["cart/CART_PRODUCTS"];
    },

    totalAmount() {
      return this.$store.getters["cart/TOTAL_AMOUNT"];
    },

    isMobile() {
      return this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs;
    },

    // Indica si hay algún token disponible para APIs (guest o real)
    hasApiToken() {
      return this.$store.getters['auth/HAS_API_TOKEN'];
    },

    showInlineAddressForm() {
      return this.radioGroup === 1 && (!this.userAddress || this.userAddress.length === 0);
    },

    shippingQuoteState() {
      return getShippingQuoteState({
        deliveryMethod: this.radioGroup,
        loading: this.loadingShippingQuote,
        resolved: this.statusQuote,
        quote: this.quote,
        error: this.errorGetQuoute
      });
    },

    isDeliveryNextDisabled() {
      if (this.radioGroup == null) {
        return true;
      }

      if (this.radioGroup == 0) {
        return this.canBuyWarehouse == null || !this.selectedWharehouse;
      }

      if (this.showInlineAddressForm) {
        return false;
      }

      if (!this.idAddress) {
        return true;
      }

      return (!this.freeShipping && !this.statusQuote) || this.errorGetQuoute;
    },

    isCheckoutProceedDisabled() {
      if (this.radioGroup !== 1) {
        return false;
      }

      if (!this.idAddress) {
        return true;
      }

      return (!this.freeShipping && !this.statusQuote) || this.errorGetQuoute;
    },

    // Datos de envío para pasar al formulario de registro (solo si eligió envío a domicilio)
    currentShippingData() {
      if (this.radioGroup !== 1) return null;
      
      // Si hay dirección seleccionada del usuario logueado
      if (this.idAddress && this.idAddress.contact_name) {
        return {
          contact_name: this.idAddress.contact_name,
          zipcode: this.idAddress.zipcode,
          contact_phone: this.idAddress.contact_phone
        };
      }
      
      // Si hay dirección guardada del guest (reactivo)
      if (this.guestAddress) {
        return {
          contact_name: this.guestAddress.contact_name,
          zipcode: this.guestAddress.zipcode,
          contact_phone: this.guestAddress.contact_phone
        };
      }
      
      return null;
    },

    // Descripción del método de pago seleccionado
    paymentMethodDescription() {
      if (this.radioGroupDues === 0) {
        return '6 Cuotas Fijas - Tarjeta de Crédito';
      }
      if (this.radioGroupCredit === 0) {
        return '1 Pago - Tarjeta de Débito/Crédito';
      }
      if (this.radioGroupTransfer === 0) {
        return 'Transferencia Bancaria';
      }
      return 'No seleccionado';
    }
  },

  methods: {
    getCheckoutTrackingPaymentType() {
      if (
        this.payments_type === "bank_transfer" ||
        this.radioGroupTransfer === 0
      ) {
        return "bank_transfer";
      }
      if (
        this.payments_type === "installments" ||
        this.radioGroupDues === 0
      ) {
        return "installments";
      }
      return "card";
    },

    getCheckoutTrackingUnitPrice(
      item,
      paymentType = this.getCheckoutTrackingPaymentType()
    ) {
      const price = item?.publication?.price || {};

      if (paymentType === "bank_transfer") {
        return cleanPrice(price.pvp_transfer ?? price.pvp);
      }

      if (paymentType === "installments") {
        return cleanPrice(price.pvp_18_installments ?? price.pvp);
      }

      return cleanPrice(price.pvp);
    },

    buildCheckoutTrackingContext(options = {}) {
      const items =
        options.items || this.productCartState?.shopping_cart_items || [];
      const paymentType =
        options.paymentType || this.getCheckoutTrackingPaymentType();
      const includeQuote = options.includeQuote !== false;
      const shippingQuote = includeQuote
        ? cleanPrice(options.quote ?? this.quote) || 0
        : 0;
      const contents = items
        .map(it => {
          const gaItem = buildItem(it, {
            price: this.getCheckoutTrackingUnitPrice(it, paymentType)
          });
          if (!gaItem || !gaItem.item_id) return null;
          return {
            id: gaItem.item_id,
            quantity: gaItem.quantity,
            item_price: gaItem.price || 0
          };
        })
        .filter(Boolean);
      const numItems = contents.reduce((acc, it) => acc + it.quantity, 0);
      const contentIds = contents.map(it => it.id);
      const itemsValue = contents.reduce((acc, it) => {
        return acc + it.item_price * it.quantity;
      }, 0);

      return {
        items,
        paymentType,
        numItems,
        contentIds,
        contents,
        value: itemsValue > 0 ? itemsValue + shippingQuote : null
      };
    },

    trackPaymentMethodSelection(methodKey) {
      const paymentType =
        methodKey === "transfer"
          ? "bank_transfer"
          : methodKey === "installments"
            ? "installments"
            : "card";
      const context = this.buildCheckoutTrackingContext({
        includeQuote: false,
        paymentType
      });

      trackCustom("SelectPaymentMethod", {
        payment_method: paymentType,
        value: context.value,
        num_items: context.numItems,
        content_ids: context.contentIds,
        content_type: "product"
      });
    },

    handleEditAddress() {
      if (this.userAddress && this.userAddress.length === 1 && this.userAddress[0].id === 'guest') {
        this.userAddress = [];
        this.idAddress = null;
        this.statusQuote = false;
        this.quote = 0;
      } else {
        this.$router.push({ name: 'profile', query: { action: 1 } });
      }
    },

    goToNextFromCart() {
      this.HandlerTrackCartView();
      // Siempre ir a Pago, independientemente de si está logueado
      this.e1 = this.paymentStep;
    },

    goToPreviousFromPayment() {
      // Volver al Carrito (paso 1)
      this.e1 = 1;
    },

    async handleDeliveryNext() {
      // Validar y guardar la dirección si el formulario está visible
      if (this.radioGroup == 1 && (!this.userAddress || this.userAddress.length === 0) && this.$refs.addressForm) {
        const isValid = await this.$refs.addressForm.validateAndSave();
        if (!isValid) return; 
      }

      // Si el usuario no está logueado, ir al paso de Cuenta (registro)
      // Si está logueado, ir al paso Checkout directamente (saltea Cuenta)
      if (!this.isAuth) {
        this.e1 = this.accountStep;
      } else {
        // Usuario logueado: cargar datos y ir al paso Checkout
        await this.prepareCheckoutForLoggedUser();
      }
    },

    toggleAuthCard() {
      this.showLoginCard = !this.showLoginCard;
    },

    // Preparar datos para el checkout cuando el usuario ya está logueado
    async prepareCheckoutForLoggedUser() {
      try {
        this.loadingCheckout = true;
        console.log(">>> prepareCheckoutForLoggedUser - isAuth:", this.isAuth);
        
        // Recargar carrito
        await this.$store.dispatch("cart/GET_CURRENT_CART");
        
        // Cargar direcciones
        await this.HandlerGetAddress();
        
        // Si es envío a domicilio, seleccionar primera dirección y calcular
        if (this.radioGroup === 1) {
          if (this.userAddress.length > 0 && !this.idAddress) {
            this.idAddress = this.userAddress[0];
          }
          if (this.idAddress) {
            await this.HandlerShippingQuote();
          }
        }
        
        this.e1 = this.checkoutStep;
      } catch (error) {
        console.log("Error preparando checkout:", error);
        this.$snotify.error("Error al cargar datos", "Error");
        // Aún así ir al checkout
        this.e1 = this.checkoutStep;
      } finally {
        this.loadingCheckout = false;
      }
    },

    toggleRecovery() {
      this.showRecovery = !this.showRecovery;
    },

    async HandlerRecoveryAccount() {
      try {
        this.loading_verification = true;
        const request = {
          email: this.email_verifiction,
          url_base: buildCheckoutUrl(),
          store_id: 3
        };
        await this.$store.dispatch("auth/RECOVERY_PASSWORD", request);
        this.showNotificationEmail = true;
      } catch (error) {
        console.log(error);
        this.$snotify.error(error.response.data.error.err_message, "Error!");
      } finally {
        this.loading_verification = false;
      }
    },

    async handleLoginSuccess() {
      // Después de login con cuenta real, restaurar selecciones y ejecutar checkout
      await this.restoreGuestSelectionsAndCheckout();
    },

    async handleRegisterSuccess() {
      // Después de registro, restaurar selecciones y ejecutar checkout
      console.log(">>> handleRegisterSuccess - isAuth:", this.isAuth);
      await this.restoreGuestSelectionsAndCheckout();
    },

    // Guardar las selecciones actuales del guest antes del login/registro
    saveGuestSelections() {
      const selections = {
        radioGroup: this.radioGroup,
        radioGroupDues: this.radioGroupDues,
        radioGroupCredit: this.radioGroupCredit,
        radioGroupTransfer: this.radioGroupTransfer,
        payments_type: this.payments_type,
        default_installments: this.default_installments,
        selectedWharehouse: this.selectedWharehouse,
        quote: this.quote
      };
      localStorage.setItem('guest_checkout_selections', JSON.stringify(selections));
    },

    // Restaurar selecciones del guest y ejecutar checkout automáticamente
    async restoreGuestSelectionsAndCheckout() {
      try {
        this.loadingCheckout = true;
        console.log(">>> restoreGuestSelectionsAndCheckout INICIO - isAuth:", this.isAuth);
        this.$snotify.info("Procesando tu compra...", "Un momento");
        
        // 1. Cargar direcciones del usuario real
        console.log(">>> Llamando HandlerGetAddress...");
        await this.HandlerGetAddress();
        console.log(">>> Direcciones cargadas:", this.userAddress?.length);
        
        // 2. Si había una dirección guardada del guest, registrarla
        const guestAddressData = localStorage.getItem('guest_address');
        if (guestAddressData) {
          try {
            const addressData = JSON.parse(guestAddressData);
            await this.$store.dispatch("auth/REGISTER_ADDRESS", addressData);
            await this.HandlerGetAddress();
            localStorage.removeItem('guest_address');
          } catch (addrError) {
            console.log("Error registrando dirección del guest:", addrError);
          }
        }
        
        // 3. Restaurar selecciones guardadas si existen
        const savedSelections = localStorage.getItem('guest_checkout_selections');
        if (savedSelections) {
          const selections = JSON.parse(savedSelections);
          this.radioGroup = selections.radioGroup;
          this.radioGroupDues = selections.radioGroupDues;
          this.radioGroupCredit = selections.radioGroupCredit;
          this.radioGroupTransfer = selections.radioGroupTransfer;
          this.payments_type = selections.payments_type;
          this.default_installments = selections.default_installments;
          this.selectedWharehouse = selections.selectedWharehouse;
          this.quote = selections.quote;
          localStorage.removeItem('guest_checkout_selections');
        }
        
        // 4. Seleccionar dirección y calcular envío si es a domicilio
        if (this.radioGroup === 1 && this.userAddress.length > 0) {
          this.idAddress = this.userAddress[0];
          await this.HandlerShippingQuote();
        }
        
        // 5. Ir al paso Checkout para ver resumen y precio de envío
        this.e1 = this.checkoutStep;
        this.$snotify.success("Datos cargados correctamente", "Éxito");
        
      } catch (error) {
        console.log("Error en restoreGuestSelectionsAndCheckout:", error);
        this.$snotify.error("Error procesando. Intentá nuevamente.", "Error");
        // Aún así ir al paso Checkout
        this.e1 = this.checkoutStep;
      } finally {
        this.loadingCheckout = false;
      }
    },

    async HandlerFinalizeFromAccount() {
      // Este método ya no se usa, se reemplazó por ir al paso Checkout
      this.e1 = this.checkoutStep;
    },

    // Método para proceder al pago desde el paso Checkout
    async HandlerProceedToPayment() {
      try {
        this.loadingCheckout = true;
        
        // Ejecutar el checkout (mostrará modal de pago según el método seleccionado)
        await this.HandlerConfirmItems();
        
      } catch (error) {
        console.log("Error en HandlerProceedToPayment:", error);
        this.$snotify.error("Error al procesar el pago. Intentá nuevamente.", "Error");
      } finally {
        this.loadingCheckout = false;
      }
    },

    selectDeliveryMethod(method) {
      this.radioGroup = method;
      this.quote = 0;
      this.statusQuote = false;
      this.errorGetQuoute = false;

      if (method === 0) {
        this.loadingCheckout = false;
        this.loadingShippingQuote = false;
        this.ValidateProductWarehouse();
        return;
      }

      this.loadingCheckout = true;
      this.loadingShippingQuote = true;
      this.HandlerShippingQuote();
    },

    async HandlerShippingQuote() {
      this.errorGetQuoute = false;
      this.statusQuote = false;

      if (this.radioGroup !== 1) {
        this.loadingCheckout = false;
        this.loadingShippingQuote = false;
        return;
      }

      if (!this.freeShipping && !this.idAddress) {
        this.loadingCheckout = false;
        this.loadingShippingQuote = false;
        return;
      }

      try {
        let calculatedQuote = 0;
        this.loadingCheckout = true;
        this.loadingShippingQuote = true;
        if (!this.freeShipping) {
          const request = {
            address_id: this.idAddress?.id || this.idAddress
          };

          const response = await this.$store.dispatch(
            "cart/SHIPPING_QUOTE_ARG",
            request
          );

          calculatedQuote = response.data.data;
        }
        this.quote = calculatedQuote;
        this.statusQuote = true;
        this.total_order = this.totalAmount + this.quote;
      } catch (error) {
        if (this.userAddress.length > 0) {
          this.errorGetQuoute = true;
        }
      } finally {
        this.loadingCheckout = false;
        this.loadingShippingQuote = false;
      }
    },

    async HandlerGetCartsProducts() {
      try {
        await this.$store.dispatch("cart/GET_CURRENT_CART");
      } catch (error) {
        console.log(error);
      }
    },

    async HandlerGetAddress() {
      try {
        const response = await this.$store.dispatch("auth/GET_ADDRESS");
        this.userAddress = response.data.data;
        this.idAddress = this.userAddress.find(addr => addr.status == true);
        return response; // Agregar return
      } catch (error) {
        console.log(error);
      }
    },

    getUserAddressPriority() {
      const userAddress = this.userAddress.find(addrr => addrr.status == true);
      if (userAddress != undefined) {
        this.idAddress = userAddress;
        return userAddress;
      } else return null;
    },

    HandlerClose() {
      this.showSelectDelivery = false;
      this.retirementValue = "";
      this.radioGroup = null;
    },

    async HandlerConfirmItems() {
      try {
        if (!this.isAuth) {
          this.e1 = this.accountStep;
          return;
        }

        const request = {
          update_items: true,
          address_id: this.idAddress?.id || null
        };
        const response = await this.$store.dispatch(
          "cart/CONFIRM_PRODUCTS_CART",
          request
        );

        const summary = response.data.data.summary;
        const shopping_cart = response.data.data.shopping_cart;

        this.$store.commit("cart/SET_CART_SUMMART", summary);

        this.confirmOrder = [
          ...this.getShoppingCartItems(summary, shopping_cart)
        ];

        // VERIFICAR SI TIENE DIRECCION REGISTRADA
        if (this.radioGroup == 1) {
          const responseAddress = await this.$store.dispatch(
            "auth/GET_ADDRESS"
          );

          if (responseAddress.data.data.length > 0) {
            // SI LA NO HAY PRODUCTOS MOSTRAAMOS LA INFO
            if (this.confirmOrder.length > 0) {
              this.showAlertCheckout = !this.showAlertCheckout;
              this.dataAlertCheckout = {
                order: this.confirmOrder,
                pickup: this.radioGroup == 0 ? true : false,
                address: this.radioGroup == 1 ? this.idAddress : "",
                response: response.data.data,
                payment_type: this.payments_type,
                default_installments: this.default_installments
              };
            } else {
              if (this.confirmOrder.length > 0) {
                this.showAlertCheckout = !this.showAlertCheckout;
                this.dataAlertCheckout = {
                  order: this.confirmOrder,
                  pickup: this.radioGroup == 0 ? true : false,
                  address: this.radioGroup == 1 ? this.idAddress : "",
                  response: response.data.data,
                  payment_type: this.payments_type,
                  default_installments: this.default_installments
                };
              } else {
                if (this.radioGroupTransfer === 0) {
                  this.HandlerTransferCheckout(shopping_cart);
                } else {
                  this.HandlerCheckout();
                }
              }
            }
          } else {
            this.$router.push({ name: "profile" });
          }
        } else {
          // this.HandlerCheckout();
          if (this.confirmOrder.length > 0) {
            this.showAlertCheckout = !this.showAlertCheckout;
            this.dataAlertCheckout = {
              order: this.confirmOrder,
              pickup: this.radioGroup == 0 ? true : false,
              address: this.radioGroup == 1 ? this.idAddress.id : "",
              response: response.data.data,
              payment_type: this.payments_type,
              default_installments: this.default_installments
            };
          } else {
            if (this.radioGroupTransfer === 0) {
              this.HandlerTransferCheckout(shopping_cart);
            } else {
              this.HandlerCheckout();
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        // this.loadingAcceptItem = false;
      }
    },

    getShoppingCartItems(summary, shopping_cart) {
      let cont = -1;
      return summary.reduce((out, current) => {
        cont++;
        if (current.available < current.requested) {
          const getItem = shopping_cart.shopping_cart_items.find(item => {
            return item.id == current.shopping_cart_item_id;
          });

          if (getItem !== undefined) {
            out.push({
              isValid: false,
              summary_position: cont,
              requested: current.requested,
              available: current.available,
              product: getItem
            });
          }
        }
        return out;
      }, []);
    },

    async HandlerCheckout() {
      try {
        if (!this.isAuth) {
          this.e1 = this.accountStep;
          return;
        }

        this.loadingCheckout = true;

        const items = this.productCartState?.shopping_cart_items || [];
        const trackingContext = this.buildCheckoutTrackingContext({ items });
        if (trackingContext.value !== null) {
          trackStandard("InitiateCheckout", {
            value: trackingContext.value,
            num_items: trackingContext.numItems,
            content_ids: trackingContext.contentIds,
            content_type: "product",
            contents: trackingContext.contents
          });
          pushEcommerce("begin_checkout", {
            currency: CURRENCY,
            value: trackingContext.value,
            items: buildItems(items)
          });
        }

        const { notificationUrl, autoReturn, backUrls } =
          buildMercadoPagoReturnConfig();
        const baseUrl = buildCheckoutUrl();
        console.log(">>> HandlerCheckout - baseUrl:", baseUrl);
        
        const request = {
          shopping_cart_id: this.productCartState.id,
          route_success: notificationUrl,
          route_failure: notificationUrl,
          route_pending: notificationUrl,
          auto_return: autoReturn,
          back_urls: backUrls,
          store_pickup: this.radioGroup == 0 ? true : false,
          addresse_id:
            this.radioGroup == 1
              ? this.idAddress?.id || 1
              : 1,
          warehouse_id:
            this.radioGroup == 0 ? Number(this.selectedWharehouse) : null,
          store_id: 3,
          payment_type: this.payments_type,
          default_installments: this.default_installments,
          quote: this.radioGroup == 0 ? 0 : this.quote,
          google_ads: getStoredClickIds()
        };

        const response = await this.$store.dispatch(
          "products/CHECKOUT_DO",
          request
        );
        console.log(">>> HandlerCheckout - response:", response);
        
        if (!response.data || !response.data.data || !response.data.data.url) {
          throw new Error("La respuesta del servidor no contiene una URL de pago válida.");
        }
        
        // En mobile, abrir en nueva ventana para permitir que MercadoPago redirija a la app
        if (this.isMobile) {
          // Guardar el cart_id para detectar cuando el checkout se complete
          localStorage.setItem('pending_checkout_cart_id', this.productCartState.id);
          // Usar location.href para asegurar que los deep links funcionen en iOS
          window.location.href = response.data.data.url;
        } else {
          // En desktop, usar el modal con iframe
          this.checkoutUrl = response.data.data.url;
          this.checkoutDialog = true;
          this.startCheckoutPolling();
        }

      } catch (error) {
        if (
          error.response &&
          error.response.data && 
          error.response.data.error &&
          error.response.data.error.message ==
          "perfil actual incompleto para realizar compra"
        ) {
          this.showAlertPerfil = true;
          this.alertPerfil = error.response.data.error.details;
          this.showSelectDelivery = !this.showSelectDelivery;
        } else {
          console.error(">>> Error en HandlerCheckout:", error);
          console.error(
            ">>> Error en HandlerCheckout - response:",
            error.response?.data
          );
          const backendMessage =
            error.response?.data?.error?.err_message ||
            error.response?.data?.error?.message ||
            error.message;
          this.$snotify.error(backendMessage || "Error al iniciar el pago", "Error");
        }
      } finally {
        this.loadingCheckout = false;
      }
    },

    handleCheckoutMessage(event) {
      const data = event.data || {};
      if (data.type === "embedded-store-navigation") {
        console.log("[checkout iframe] embedded navigation:", data.href);
        this.closeCheckoutDialog();
        return;
      }

      if (data.type === "checkout-error") {
        console.log("[checkout iframe] checkout error");
        this.closeCheckoutDialog();
        return;
      }

      if (data.type === "mp-checkout-result") {
        if (data.success) {
          this.$store.commit("cart/CLEAN_CART");
        }
        this.closeCheckoutDialog();
        if (data.success && data.query) {
          this.$router.push({
            name: "checkout_notifiction",
            query: data.query
          });
        }
      }
    },

    handleCheckoutFrameLoad() {
      this.inspectCheckoutFrame();
    },

    inspectCheckoutFrame() {
      if (!this.checkoutDialog) {
        return;
      }

      const iframe = this.$refs.checkoutFrame;
      if (!iframe || !iframe.contentWindow) {
        return;
      }

      try {
        const iframeUrl = iframe.contentWindow.location.href;
        if (!iframeUrl || iframeUrl === "about:blank") {
          return;
        }

        if (iframeUrl !== this.lastCheckoutFrameUrl) {
          console.log("[checkout iframe] url:", iframeUrl);
          this.lastCheckoutFrameUrl = iframeUrl;
          this.checkoutFrameCrossOriginLogged = false;
        }

        if (/mercadopago/i.test(iframeUrl)) {
          return;
        }

        const iframeLocation = new URL(iframeUrl);
        const nextUrl =
          `${iframeLocation.pathname}${iframeLocation.search}${iframeLocation.hash}`;
        const currentUrl =
          `${window.location.pathname}${window.location.search}${window.location.hash}`;

        this.closeCheckoutDialog();

        if (nextUrl !== currentUrl) {
          window.location.href = iframeUrl;
        }
      } catch (error) {
        if (!this.checkoutFrameCrossOriginLogged) {
          console.log(
            "[checkout iframe] cross-origin navigation; current URL is not readable"
          );
          this.checkoutFrameCrossOriginLogged = true;
        }
      }
    },

    handleStorageChange(event) {
      // Detectar cuando el checkout se completa desde otra pestaña
      if (event.key === 'checkout_completed' && event.newValue) {
        try {
          const result = JSON.parse(event.newValue);
          if (result.success) {
            this.$store.commit("cart/CLEAN_CART");
            this.$snotify.success('¡Pago completado exitosamente!', 'Éxito');
          }
          // Limpiar polling si existe
          if (this.checkoutPollInterval) {
            clearInterval(this.checkoutPollInterval);
          }
          localStorage.removeItem('checkout_completed');
          localStorage.removeItem('pending_checkout_cart_id');
          // Redirigir a la página de notificación
          if (result.query) {
            this.$router.push({
              name: "checkout_notifiction",
              query: result.query
            });
          }
        } catch (e) {
          console.log("Error parsing checkout result", e);
        }
      }
    },

    closeCheckoutDialog() {
      if (this.checkoutPollInterval) {
        clearInterval(this.checkoutPollInterval);
        this.checkoutPollInterval = null;
      }
      this.checkoutDialog = false;
      this.checkoutUrl = "";
      this.lastCheckoutFrameUrl = "";
      this.checkoutFrameCrossOriginLogged = false;
    },

    HandlerCloseAcceptProduct() {
      this.showAlertCheckout = false;
    },

    async ValidateProductWarehouse() {
      try {
        this.loadingCheckout = true;
        const publication_ids = this.productCartState.shopping_cart_items.map(
          item => {
            return item.publication_id;
          }
        );

        const request = {
          publication_ids: [...publication_ids],
          debug: true
        };

        const response = await this.$store.dispatch(
          "products/VALIDATE_PRODUCT_WAREHOUSE",
          request
        );

        this.availableWharehouses = response.data.data.same_warehouse_summary.filter(
          w => w.count > 0
        );

        this.canBuyWarehouse = true;

        //if (response.data.data.store_pickup == false)
        //  this.alertNotificationBuy = true;
        //if (response.data.data.store_pickup == true)
        //  this.canBuyWarehouse = response.data.data.warehouse;
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingCheckout = false;
      }
    },

    async canCheckoutStepper() {
      // Ya no verificamos isAuth aquí - permitimos que guests continúen
      // La verificación de perfil solo aplica si el usuario está logueado
      if (this.isAuth) {
        try {
          const profileCheck = await this.checkProfileComplete();
          if (!profileCheck.complete) {
            this.showAlertPerfil = true;
            this.alertPerfil = profileCheck.missingFields;
            return;
          }
        } catch (error) {
          console.log(error);
        }
      }
      
      this.errorGetQuoute = false;
      if (this.radioGroupDues === 0) {
        this.payments_type = "installments";
        this.default_installments = 6;
        this.e1 = this.deliveryStep;
        this.totalPrice();
      }

      if (this.radioGroupCredit === 0) {
        this.payments_type = "card";
        this.default_installments = "";
        this.e1 = this.deliveryStep;
        this.totalPrice();
      }

      if (this.radioGroupTransfer === 0) {
        this.payments_type = "bank_transfer";
        this.default_installments = "";
        this.e1 = this.deliveryStep;
        this.totalPrice();
      }
    },

    async checkProfileComplete() {
      try {
        const user = this.$store.getters["auth/GET_PROFILE"];
        const missingFields = [];
        
        if (!user.buyer?.doc_type) missingFields.push("doc_type");
        if (!user.buyer?.doc_number) missingFields.push("doc_number");
        if (!user.buyer?.phone) missingFields.push("phone");
        if (!user.buyer?.first_name) missingFields.push("first_name");
        
        return {
          complete: missingFields.length === 0,
          missingFields: missingFields
        };
      } catch (error) {
        return { complete: true, missingFields: [] };
      }
    },

    checkoutType(val) {
      switch (val) {
        case 1:
          this.dues = true;
          this.radioGroupDues = 0;
          this.credit = false;
          this.radioGroupCredit = null;
          this.transfer = false;
          this.radioGroupTransfer = null;
          this.payments_type = "installments";
          this.default_installments = 6;
          this.trackPaymentMethodSelection("installments");
          break;
        case 2:
          this.dues = false;
          this.radioGroupDues = null;
          this.credit = true;
          this.radioGroupCredit = 0;
          this.transfer = false;
          this.radioGroupTransfer = null;
          this.payments_type = "card";
          this.default_installments = "";
          this.trackPaymentMethodSelection("card");
          break;
        case 3:
          this.dues = false;
          this.radioGroupDues = null;
          this.credit = false;
          this.radioGroupCredit = null;
          this.transfer = true;
          this.radioGroupTransfer = 0;
          this.payments_type = "bank_transfer";
          this.default_installments = "";
          this.trackPaymentMethodSelection("transfer");
          break;
      }
    },

    canCheckout() {
      if (!this.isAuth) {
        this.e1 = this.accountStep;
        return;
      }
      this.errorGetQuoute = false;
      if (this.radioGroupDues === 0) {
        this.showSelectDelivery = true;
        this.payments_type = "installments";
        this.default_installments = 6;
        this.totalPrice();
      }

      if (this.radioGroupCredit === 0) {
        this.showSelectDelivery = true;
        this.payments_type = "card";
        this.default_installments = "";
        this.totalPrice();
      }

      if (this.radioGroupTransfer === 0) {
        this.showSelectDelivery = true;
        this.payments_type = "bank_transfer";
        this.default_installments = "";
        this.totalPrice();
      }
    },

    async HandlerTransferCheckout(cart) {
      try {
        if (!this.isAuth) {
          this.e1 = this.accountStep;
          return;
        }

        this.loadingCheckout = true;

        const trackingContext = this.buildCheckoutTrackingContext({
          items:
            cart?.shopping_cart_items ||
            this.productCartState?.shopping_cart_items ||
            []
        });
        if (trackingContext.value !== null) {
          trackStandard("InitiateCheckout", {
            value: trackingContext.value,
            num_items: trackingContext.numItems,
            content_ids: trackingContext.contentIds,
            content_type: "product",
            contents: trackingContext.contents,
            payment_method: "bank_transfer"
          });
        }

        const id = this.idAddress?.id || null;
        const request = {
          store_id: 3,
          store_pickup: this.radioGroup == 0 ? true : false,
          shopping_cart_id: cart.id,
          addresse_id: id,
          warehouse_id:
            this.radioGroup == 0 ? Number(this.selectedWharehouse) : null,
          quote: this.radioGroup == 0 ? 0 : this.quote,
          google_ads: getStoredClickIds()
        };

        const response = await this.$store.dispatch(
          "checkout/CHECKOUT_TRANSFER",
          request
        );

        await this.goToEmailTransfer();

        this.responseTransferCheckout = response.data.data;
        this.showModalTransfer = true;
      } catch (error) {
        if (
          error.response.data.error.message ==
          "perfil actual incompleto para realizar compra"
        ) {
          this.showAlertPerfil = true;
          this.alertPerfil = error.response.data.error.details;
          this.showSelectDelivery = !this.showSelectDelivery;
        }
      } finally {
        this.loadingCheckout = false;
      }
    },

    totalPriceOnePayment(cart_items) {
      let priceTotal = 0;
      if (cart_items != undefined) {
        priceTotal = cart_items.reduce((acc, arr) => {
          acc += arr.publication.price.pvp * arr.original_quantity;
          return acc;
        }, 0);
      }
      return priceTotal;
    },

    HandlerTrackCartView() {
      const items = this.productCartState?.shopping_cart_items || [];
      if (!items.length) return;
      const numItems = items.reduce(
        (acc, it) => acc + (it.original_quantity || 0),
        0
      );
      const value = cleanPrice(this.totalPriceOnePayment(items));
      if (value === null) return;
      const contentIds = items
        .map(it => it.publication_id || it.publication?.id)
        .filter(Boolean)
        .map(String);
      trackCustom("CartView", {
        currency: "ARS",
        value,
        num_items: numItems,
        content_ids: contentIds,
        content_type: "product"
      });
      pushEcommerce("view_cart", {
        currency: CURRENCY,
        value,
        items: buildItems(items)
      });
    },

    totalPrice(cart_items) {
      let priceTotal = 0;
      if (cart_items != undefined) {
        priceTotal = cart_items.reduce((acc, arr) => {
          if (this.radioGroupDues === 0) {
            acc +=
              arr.publication.price.pvp_18_installments * arr.original_quantity;
          } else if (this.radioGroupCredit === 0) {
            acc += arr.publication.price.pvp * arr.original_quantity;
          } else if (this.radioGroupTransfer === 0) {
            acc += arr.publication.price.pvp_transfer * arr.original_quantity;
          }
          return acc;
        }, 0);
      }
      return priceTotal;
    },

    getItemDisplayPrice(item) {
      if (!item || !item.publication || !item.publication.price) return 0;
      if (this.radioGroupDues === 0) {
        return item.publication.price.pvp_18_installments || item.publication.price.pvp || 0;
      }
      // For bank transfer, the discount is shown as a separate subtrahend, 
      // so we use standard PVP for the unit-price display to keep it clear.
      return item.publication.price.pvp || 0;
    },

    async goToEmailTransfer() {
      try {
        this.loadingLocation = true;

        await this.$store.dispatch("products/EMAIL_TRANSFER");
        this.$snotify.success(
          `Se ha enviado un email con los datos bancarios`,
          "Exitos"
        );
      } catch (error) {
        this.$snotify.error(
          "No se ha podido enviar los datos al correo, intente mas tarde",
          "Error"
        );
      } finally {
        this.loadingLocation = false;
      }
    },

    HandlerAddressAdded(addressData) {
      // Si el usuario está autenticado, cargar direcciones del servidor
      if (this.isAuth) {
        this.HandlerGetAddress().then(() => {
          // Seleccionar la nueva dirección y recalcular envío
          if (this.userAddress.length > 0 && this.radioGroup === 1) {
            this.idAddress = this.userAddress.find(addr => addr.status === true) || this.userAddress[0];
            this.HandlerShippingQuote();
          }
        });
      } else {
        // Para guests, usar la dirección que viene del formulario
        if (addressData) {
          this.guestAddress = addressData;
          // Crear un objeto similar a las direcciones del servidor para usar en el UI
          const fakeAddress = {
            id: 'guest',
            street: addressData.street,
            street_number: addressData.street_number,
            location: addressData.location,
            zipcode: addressData.zipcode,
            status: true
          };
          this.userAddress = [fakeAddress];
          this.idAddress = fakeAddress;
          // Para guests, marcamos que tienen dirección pero no cotizamos envío
          // La cotización se hará después del registro
          this.statusQuote = true;
          this.quote = 0; // Se calculará después del registro
        }
      }
    },

    async HandlerProfileUpdated() {
        this.showAlertPerfil = false;
        await this.$store.dispatch("auth/AUTH_USER"); // Refresh user data
        // Retry the checkout process depending on the flow
        if (this.radioGroupTransfer === 0) {
             const shopping_cart = this.productCartState; // Assuming this holds the necessary cart info or re-fetch
             this.HandlerTransferCheckout(shopping_cart);
        } else {
             this.HandlerCheckout();
        }
    },

    checkCompletedCheckout() {
      // Verificar si hay un checkout completado pendiente de procesar
      const checkoutCompleted = localStorage.getItem('checkout_completed');
      if (checkoutCompleted) {
        try {
          const result = JSON.parse(checkoutCompleted);
          if (result.success) {
            this.$store.commit("cart/CLEAN_CART");
            this.$snotify.success('¡Compra completada exitosamente!', 'Éxito');
          }
          localStorage.removeItem('checkout_completed');
          localStorage.removeItem('pending_checkout_cart_id');
          // Redirigir a la página de notificación si no estamos ahí
          if (result.query && this.$route.name !== 'checkout_notifiction') {
            this.$router.push({
              name: "checkout_notifiction",
              query: result.query
            });
          }
        } catch (e) {
          console.log("Error processing checkout result", e);
        }
      }
    },

    isAppleDevice() {
      const ua = navigator.userAgent.toLowerCase();
      const platform = navigator.platform?.toLowerCase() || '';
      
      // Detectar iOS (iPhone, iPad, iPod)
      const isIOS = /iphone|ipad|ipod/.test(ua) || 
                    (platform === 'macintel' && navigator.maxTouchPoints > 1); // iPad con iPadOS
      
      // Detectar Safari en macOS (no Chrome/Firefox/Edge en Mac)
      const isMacSafari = /macintosh|mac os x/.test(ua) && 
                          /safari/.test(ua) && 
                          !/chrome|chromium|firefox|edge|opera|opr/.test(ua);
      
      return isIOS || isMacSafari;
    },

    startCheckoutPolling() {
      // Limpiar cualquier polling anterior
      if (this.checkoutPollInterval) {
        clearInterval(this.checkoutPollInterval);
      }
      
      // Poll cada 2 segundos para verificar si el checkout se completó
      this.checkoutPollInterval = setInterval(() => {
        this.inspectCheckoutFrame();

        const checkoutResult = localStorage.getItem('checkout_completed');
        if (checkoutResult) {
          clearInterval(this.checkoutPollInterval);
          this.checkoutPollInterval = null;
          const result = JSON.parse(checkoutResult);
          localStorage.removeItem('checkout_completed');
          localStorage.removeItem('pending_checkout_cart_id');
          
          if (result.success) {
            this.$store.commit("cart/CLEAN_CART");
            this.$snotify.success('¡Pago completado exitosamente!', 'Éxito');
          }
          
          // Redirigir a la página de notificación
          this.$router.push({
            name: "checkout_notifiction",
            query: result.query
          });
        }
      }, 500);
      
      // Detener el polling después de 10 minutos (por si el usuario abandona)
      setTimeout(() => {
        if (this.checkoutPollInterval) {
          clearInterval(this.checkoutPollInterval);
          this.checkoutPollInterval = null;
          localStorage.removeItem('pending_checkout_cart_id');
        }
      }, 600000);
    }
  }
};
</script>

<style scoped>
/* Custom Styles for Modern Cart */
.bg-transparent {
    background-color: transparent !important;
}

.shadow-blue {
    box-shadow: none !important;
}

.primary-underline {
    width: 40px;
    height: 3px;
    background-color: #00A0E9;
    border-radius: 2px;
}

/* Payment Cards */
.payment-card {
    border: 1px solid #E0E0E0 !important;
    background-color: white !important;
    border-radius: 8px !important;
}

.payment-card:hover {
    border-color: #B3E5FC !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}

.selected-payment-card {
    border-color: #00A0E9 !important;
    background-color: #F0F9FF !important;
}

/* Delivery Option Cards */
.delivery-option-card {
    border: 1px solid #E0E0E0 !important;
    background-color: white !important;
    border-radius: 8px !important;
}

.selected-delivery-card {
    border-color: #00A0E9 !important;
    background-color: #F0F9FF !important;
}

.transition-swing {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

/* Input overrides */
.v-input--radio-group--column .v-radio {
    margin-bottom: 4px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.checkout-frame-wrapper {
  height: 80vh;
  background: #f9f9f9;
}

.checkout-frame {
  width: 100%;
  height: 80vh;
  border: none;
}

@media (max-width: 960px) {
  .checkout-frame-wrapper,
  .checkout-frame {
    height: 70vh;
  }
}
</style>
