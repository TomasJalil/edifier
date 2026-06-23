# QA — Event Payload Checklist

Use this guide after any change that touches `metaPixel.js`, `googleAnalytics.js`, or the components below.
Validate with **Meta Pixel Helper** (Chrome extension) and **Google Tag Assistant** (or GTM Preview).

---

## Tools

| Tool | Purpose |
|------|---------|
| Meta Pixel Helper (Chrome extension) | Inspect every `fbq()` call fired on the page, see full payload |
| Google Tag Assistant / GTM Preview | Inspect `window.dataLayer` pushes; confirm `ecommerce: null` clears before each event |
| Browser DevTools → Console | `window.dataLayer` to dump the full array; `window.fbq` to confirm it's a function |

---

## 1. ViewContent — Product Detail page

**Trigger:** navigate to any product page.

**Meta Pixel Helper — expected event:**

| Field | Expected | Notes |
|-------|----------|-------|
| `event` | `ViewContent` | — |
| `currency` | `ARS` | — |
| `value` | integer (e.g. `178490`) | must not be `0` or absent |
| `content_ids` | `["<product_id>"]` | string array |
| `content_type` | `product` | — |
| `content_name` | product keyword string | — |
| `content_category` | category string (if available) | — |

**dataLayer — expected push:**

```json
{ "ecommerce": null }
{ "event": "view_item", "ecommerce": { "currency": "ARS", "value": 178490, "items": [{ "item_id": "...", "item_name": "...", "item_brand": "Edifier", "price": 178490, "quantity": 1, "item_category": "..." }] } }
```

**Failure modes:**
- `value` is `0` or missing → `cleanPrice` got a bad price source; check `publication.price.pvp`
- Event fires twice → `_viewContentSent` guard not working; reload and check
- `content_category` missing → product has no `category_name` and no `category` field (acceptable)

---

## 2. AddToCart — Product Detail page

**Trigger:** click "Agregar al carrito".

**Meta Pixel Helper — expected event:**

| Field | Expected | Notes |
|-------|----------|-------|
| `event` | `AddToCart` | — |
| `currency` | `ARS` | — |
| `value` | `unitPrice × quantity` (integer) | e.g. `178490` for qty 1 |
| `content_ids` | `["<product_id>"]` | — |
| `content_type` | `product` | — |
| `content_name` | keyword string | — |
| `contents` | `[{ id, quantity, item_price }]` | `item_price` must be present |

**dataLayer — expected push:**

```json
{ "ecommerce": null }
{ "event": "add_to_cart", "ecommerce": { "currency": "ARS", "value": 178490, "items": [{ "item_id": "...", "item_name": "...", "price": 178490, "quantity": 1 }] } }
```

**Failure modes:**
- No event fires at all → check that `fbq` is a function (`typeof window.fbq` in console)
- `value` absent or `0` → `cleanPrice(publication.price.pvp)` returned null; inspect raw price
- `contents[0].item_price` missing → update to include `item_price` in `contents` map
- `cs_est: true` appears and payload is nearly empty → Meta Event Setup Tool override is active; deactivate it in Meta Business Manager → Events Manager → Event Setup Tool

---

## 3. CartView — Cart page

**Trigger:** open the cart (navigate to `/cart`).

**Meta Pixel Helper — expected custom event:**

| Field | Expected |
|-------|----------|
| `event` | `CartView` |
| `value` | total cart value (integer ARS) |
| `num_items` | total item count |
| `content_ids` | array of product ID strings |
| `content_type` | `product` |

**Failure modes:**
- Event fires with empty payload → cart was empty when view triggered; add a product first
- `value` is `0` → `totalPriceOnePayment` returned a bad value; check Vuex cart state

---

## 4. InitiateCheckout — Cart page (Checkout button)

**Trigger:** click "Iniciar Compra" / checkout button in cart.

**Meta Pixel Helper — expected event:**

| Field | Expected |
|-------|----------|
| `event` | `InitiateCheckout` |
| `currency` | `ARS` |
| `value` | total integer |
| `num_items` | item count |
| `content_ids` | `["id1", "id2", ...]` |
| `content_type` | `product` |
| `contents` | `[{ id, quantity, item_price }, ...]` |

**dataLayer — expected push:**

```json
{ "ecommerce": null }
{ "event": "begin_checkout", "ecommerce": { "currency": "ARS", "value": ..., "items": [...] } }
```

**Failure modes:**
- Nothing fires → `checkoutValue` was null (bad price); inspect `cleanPrice(totalPriceOnePayment(...))` in console
- `contents[n].item_price` is `0` for all items → `publication.price.pvp` not populated in cart items; check `GET_CURRENT_CART` response

---

## 5. Purchase — CheckoutNotification page (after MercadoPago redirect)

**Trigger:** successful MP payment → browser redirects to `/checkout-notification?status=approved&...`

**Meta Pixel Helper — expected event:**

| Field | Expected |
|-------|----------|
| `event` | `Purchase` |
| `currency` | `ARS` |
| `value` | order total (integer) |
| `order_id` | `"<payment_id>"` |
| `content_type` | `product` |
| `content_ids` | `["id1", ...]` |
| `num_items` | item count |
| `contents` | `[{ id, quantity, item_price }, ...]` |

Event must carry `eventID: "purchase_<payment_id>"` for CAPI deduplication.

**dataLayer — expected push:**

```json
{ "ecommerce": null }
{ "event": "purchase", "ecommerce": { "transaction_id": "<external_reference>", "currency": "ARS", "value": ..., "items": [...], "num_items": ... } }
```

**Failure modes:**
- Event fires twice in same session → `sessionStorage` key `meta_purchase_fired_<paymentId>` is being cleared; do not clear sessionStorage between attempts
- `value` is `null`/absent → `meta_pixel.total_amount` from backend was 0 or missing; check `AuthMercadoPagoController::GET_ANSWER` response
- `contents` missing → `meta_pixel.items` array was empty in backend response
- Event fires for a different store → `meta_pixel.store_id` check is rejecting; verify `EDIFIER_STORE_ID = 3`

---

## General rules

1. **No `cs_est: true` in any event.** If you see it, an Event Setup Tool rule is overriding the code-fired event. Go to Meta Business Manager → Events Manager → the pixel → Event Setup Tool and remove the conflicting rule.

2. **`currency: ARS` must appear** in all standard (non-custom) events. It is injected automatically by `trackStandard`.

3. **`value` must be a positive integer.** A `0` or missing value means `cleanPrice` got null/zero/string-that-parsed-to-zero.

4. **GA4 `ecommerce: null` must precede every ecommerce push.** Tag Assistant shows both pushes; verify the clear always comes first.

5. **Dedup keys in sessionStorage** (`meta_purchase_fired_*`, `google_purchase_fired_*`) prevent double-firing on page reload. To test a purchase event a second time, clear sessionStorage from DevTools → Application → Session Storage.
