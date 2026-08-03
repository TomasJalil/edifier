# Purchase fixes design

## Goal

Correct two inconsistent purchase states: home delivery must show `Calculando` while a fresh quote is pending, and purchase actions must not be available when the same availability rule that shows `AVISAME` rejects the publication.

## Design

Create a small CommonJS-compatible purchase-state utility so its decisions can be exercised by the existing Node test runner and imported by Vue 2. The utility will give loading precedence over a stale zero-value quote and will combine general stock with the already-calculated warehouse threshold result.

`Cart.vue` will reset the previous quote synchronously when home delivery is selected, use one selection path instead of duplicate `click`/`change` quote requests, and only mark a zero quote as free after a successful response. `ProductDetails.vue` and `informationCP.vue` will use the same purchasability decision for rendering and handler guards.

## Error handling

A failed or skipped quote is not free. Existing quote errors remain visible, and a purchase handler called programmatically for an unavailable publication returns without changing the cart or navigating.

## Verification

Node tests will cover pending versus confirmed-free quote states and the stock/threshold combination. The complete test suite and production build must pass.
