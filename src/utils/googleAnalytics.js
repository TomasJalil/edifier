'use strict';

const { cleanPrice } = require('./metaPixel');

const CURRENCY = 'ARS';
const DEFAULT_BRAND = 'Edifier';
const GA4_MEASUREMENT_ID = 'G-NT3VYBK95E';
const GOOGLE_ADS_CONVERSION_ID = 'AW-17367495740';

function dataLayerAvailable() {
  return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
}

/**
 * Push a GA4 e-commerce event to the dataLayer.
 *
 * GA4 requires that the previous `ecommerce` object is cleared before a new
 * one is pushed; otherwise stale fields from the previous event leak into the
 * next one. We always push `{ ecommerce: null }` first.
 *
 * Silent no-op when `window.dataLayer` is not available (SSR, tests).
 */
function pushEcommerce(eventName, payload) {
  if (!dataLayerAvailable()) return;
  if (!eventName) return;
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event: eventName, ecommerce: payload || {} });
}

/**
 * Lower-level push for non-ecommerce dataLayer events.
 */
function pushEvent(eventName, payload) {
  if (!dataLayerAvailable()) return;
  if (!eventName) return;
  window.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
}

function pickFirst(obj, keys) {
  if (!obj) return undefined;
  for (let i = 0; i < keys.length; i++) {
    const v = obj[keys[i]];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

/**
 * Build a single GA4 e-commerce item from a cart row, a publication, or a
 * loose object. Accepts both the cart shape used in Vuex
 * (`{ publication_id, original_quantity, publication: {...} }`) and the raw
 * publication shape (`{ id, name, price: { pvp } }`).
 *
 * Always returns an item with integer ARS `price` (via cleanPrice) and a
 * numeric `quantity`. Returns `null` for falsy input.
 */
function buildItem(input, options) {
  if (!input) return null;
  options = options || {};
  const publication = input.publication || input;
  const price = publication.price || input.price || {};

  const rawQuantity =
    options.quantity != null
      ? options.quantity
      : input.original_quantity != null
        ? input.original_quantity
        : input.quantity != null
          ? input.quantity
          : 1;
  const quantity = Number(rawQuantity) || 0;

  const rawPrice =
    options.price != null
      ? options.price
      : pickFirst(price, ['pvp', 'amount', 'value', 'unit_price']) ||
        publication.price_pvp ||
        publication.unit_price;

  const itemId =
    pickFirst(input, ['publication_id']) ||
    pickFirst(publication, ['id', 'sku']) ||
    '';
  const itemName =
    options.item_name ||
    pickFirst(publication, ['name', 'title', 'keywords']) ||
    '';

  const item = {
    item_id: String(itemId || ''),
    item_name: String(itemName || ''),
    item_brand: options.item_brand || DEFAULT_BRAND,
    price: cleanPrice(rawPrice) ?? 0,
    quantity,
  };

  const category =
    options.item_category ||
    pickFirst(publication, ['category', 'category_name']);
  if (category) item.item_category = String(category);

  return item;
}

function buildItems(list, options) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const it = buildItem(list[i], options);
    if (it) out.push(it);
  }
  return out;
}

module.exports = {
  CURRENCY,
  DEFAULT_BRAND,
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_ID,
  pushEcommerce,
  pushEvent,
  buildItem,
  buildItems,
  cleanPrice,
};
module.exports.pushEcommerce = pushEcommerce;
module.exports.pushEvent = pushEvent;
module.exports.buildItem = buildItem;
module.exports.buildItems = buildItems;
module.exports.cleanPrice = cleanPrice;
