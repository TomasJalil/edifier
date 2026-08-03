'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getShippingQuoteState,
  canPurchasePublication,
} = require('../src/utils/purchaseState');

function publication(overrides = {}) {
  return {
    product: {
      product_warehouse: [{ warehouse_id: 5, current_stock: 4 }],
    },
    store: { out_stock: false },
    out_stock: false,
    ...overrides,
  };
}

test('shipping quote: a new calculation wins over a stale resolved free quote', () => {
  const state = getShippingQuoteState({
    deliveryMethod: 1,
    loading: true,
    resolved: true,
    quote: 0,
    error: false,
  });

  assert.equal(state, 'calculating');
});

test('shipping quote: zero is free only after a successful resolution', () => {
  assert.equal(
    getShippingQuoteState({
      deliveryMethod: 1,
      loading: false,
      resolved: true,
      quote: 0,
      error: false,
    }),
    'free'
  );

  assert.equal(
    getShippingQuoteState({
      deliveryMethod: 1,
      loading: false,
      resolved: false,
      quote: 0,
      error: false,
    }),
    'pending'
  );
});

test('purchase availability: general stock is insufficient without a valid threshold', () => {
  assert.equal(canPurchasePublication(publication(), false), false);
});

test('purchase availability: actions are allowed when stock and threshold are valid', () => {
  assert.equal(canPurchasePublication(publication(), true), true);
});

test('purchase availability: publication and store stock flags still block actions', () => {
  assert.equal(
    canPurchasePublication(publication({ out_stock: true }), true),
    false
  );
  assert.equal(
    canPurchasePublication(publication({ store: { out_stock: true } }), true),
    false
  );
});
