'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

function loadFresh() {
  delete require.cache[require.resolve('../src/utils/googleAnalytics')];
  return require('../src/utils/googleAnalytics');
}

function setupDataLayer() {
  global.window = { dataLayer: [] };
  return global.window.dataLayer;
}

function teardownWindow() {
  delete global.window;
}

test('pushEcommerce: clears ecommerce then pushes event', () => {
  const dl = setupDataLayer();
  const { pushEcommerce } = loadFresh();

  pushEcommerce('view_item', { currency: 'ARS', value: 100, items: [] });

  assert.equal(dl.length, 2);
  assert.deepEqual(dl[0], { ecommerce: null });
  assert.equal(dl[1].event, 'view_item');
  assert.equal(dl[1].ecommerce.currency, 'ARS');
  assert.equal(dl[1].ecommerce.value, 100);

  teardownWindow();
});

test('pushEcommerce: silent no-op when dataLayer is missing', () => {
  delete global.window;
  const { pushEcommerce } = loadFresh();
  assert.doesNotThrow(() =>
    pushEcommerce('purchase', { transaction_id: '1' })
  );
});

test('pushEcommerce: silent no-op when eventName empty', () => {
  const dl = setupDataLayer();
  const { pushEcommerce } = loadFresh();

  pushEcommerce('', { value: 5 });
  pushEcommerce(null, { value: 5 });

  assert.equal(dl.length, 0);
  teardownWindow();
});

test('pushEvent: adds event property to payload', () => {
  const dl = setupDataLayer();
  const { pushEvent } = loadFresh();

  pushEvent('login', { method: 'email' });

  assert.equal(dl.length, 1);
  assert.equal(dl[0].event, 'login');
  assert.equal(dl[0].method, 'email');

  teardownWindow();
});

test('buildItem: from Vuex cart row uses original_quantity and publication price', () => {
  const { buildItem } = loadFresh();
  const cartRow = {
    publication_id: 42,
    original_quantity: 3,
    publication: {
      id: 42,
      name: 'Edifier R1280T',
      price: { pvp: '$ 178.490,00' },
      category: 'speakers',
    },
  };

  const item = buildItem(cartRow);
  assert.equal(item.item_id, '42');
  assert.equal(item.item_name, 'Edifier R1280T');
  assert.equal(item.item_brand, 'Edifier');
  assert.equal(item.price, 178490);
  assert.equal(item.quantity, 3);
  assert.equal(item.item_category, 'speakers');
});

test('buildItem: from raw publication defaults quantity to 1', () => {
  const { buildItem } = loadFresh();
  const pub = {
    id: 7,
    name: 'Edifier S2000MKIII',
    price: { pvp: 522390 },
  };

  const item = buildItem(pub);
  assert.equal(item.item_id, '7');
  assert.equal(item.item_name, 'Edifier S2000MKIII');
  assert.equal(item.price, 522390);
  assert.equal(item.quantity, 1);
});

test('buildItem: options override quantity, price, name', () => {
  const { buildItem } = loadFresh();
  const cartRow = {
    publication_id: 9,
    publication: { name: 'X', price: { pvp: 100 } },
  };

  const item = buildItem(cartRow, {
    quantity: 5,
    price: 250,
    item_name: 'Override',
  });
  assert.equal(item.item_name, 'Override');
  assert.equal(item.price, 250);
  assert.equal(item.quantity, 5);
});

test('buildItem: returns null for falsy input', () => {
  const { buildItem } = loadFresh();
  assert.equal(buildItem(null), null);
  assert.equal(buildItem(undefined), null);
});

test('buildItem: missing identifiers degrade gracefully', () => {
  const { buildItem } = loadFresh();
  const item = buildItem({ original_quantity: 2, publication: {} });
  assert.equal(item.item_id, '');
  assert.equal(item.item_name, '');
  assert.equal(item.item_brand, 'Edifier');
  assert.equal(item.price, 0);
  assert.equal(item.quantity, 2);
});

test('buildItems: maps array, drops null entries', () => {
  const { buildItems } = loadFresh();
  const out = buildItems([
    { publication_id: 1, original_quantity: 1, publication: { name: 'A', price: { pvp: 10 } } },
    null,
    { publication_id: 2, original_quantity: 4, publication: { name: 'B', price: { pvp: 20 } } },
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].item_id, '1');
  assert.equal(out[0].quantity, 1);
  assert.equal(out[1].item_id, '2');
  assert.equal(out[1].quantity, 4);
});

test('buildItems: returns [] for non-array input', () => {
  const { buildItems } = loadFresh();
  assert.deepEqual(buildItems(undefined), []);
  assert.deepEqual(buildItems('nope'), []);
});

test('buildItem: price is 0 when cleanPrice returns null (zero or invalid source)', () => {
  const { buildItem } = loadFresh();
  // price: 0 in source → cleanPrice returns null → item price falls back to 0
  const item = buildItem({ id: 5, name: 'Test', price: { pvp: 0 } });
  assert.equal(item.price, 0);
  // price: undefined → same fallback
  const item2 = buildItem({ id: 6, name: 'Test2', price: {} });
  assert.equal(item2.price, 0);
});

test('exported constants reflect Edifier configuration', () => {
  const { CURRENCY, DEFAULT_BRAND, GA4_MEASUREMENT_ID, GOOGLE_ADS_CONVERSION_ID } = loadFresh();
  assert.equal(CURRENCY, 'ARS');
  assert.equal(DEFAULT_BRAND, 'Edifier');
  assert.equal(GA4_MEASUREMENT_ID, 'G-NT3VYBK95E');
  assert.equal(GOOGLE_ADS_CONVERSION_ID, 'AW-17367495740');
});
