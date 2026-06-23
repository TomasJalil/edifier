'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const nodeCrypto = require('node:crypto');

const { cleanPrice, filterPayload, trackStandard, trackCustom, initWithEmail, sha256Hex } = require(
  '../src/utils/metaPixel'
);

function expectedSha256(text) {
  return nodeCrypto.createHash('sha256').update(text).digest('hex');
}

test('cleanPrice: argentine formatted strings', () => {
  assert.equal(cleanPrice('$178.490'), 178490);
  assert.equal(cleanPrice('$ 178.490'), 178490);    // space after symbol
  assert.equal(cleanPrice('$ 522.390,00'), 522390);
  assert.equal(cleanPrice('587.970'), 587970);
  assert.equal(cleanPrice('178490'), 178490);        // plain unformatted string
  assert.equal(cleanPrice('$1.000.000,50'), 1000001);
  assert.equal(cleanPrice('$ 123.456.789'), 123456789);
});

test('cleanPrice: raw numbers pass through rounded', () => {
  assert.equal(cleanPrice(178490), 178490);
  assert.equal(cleanPrice(178490.4), 178490);
  assert.equal(cleanPrice(178490.6), 178491);
});

test('cleanPrice: zero and nullish inputs return null', () => {
  assert.equal(cleanPrice(0), null);
  assert.equal(cleanPrice(''), null);
  assert.equal(cleanPrice(null), null);
  assert.equal(cleanPrice(undefined), null);
  assert.equal(cleanPrice('   '), null);
  assert.equal(cleanPrice('$0'), null);
  assert.equal(cleanPrice('0'), null);
});

test('cleanPrice: invalid / garbage inputs return null', () => {
  assert.equal(cleanPrice('abc'), null);
  assert.equal(cleanPrice(NaN), null);
  assert.equal(cleanPrice(Infinity), null);
  assert.equal(cleanPrice(-Infinity), null);
  assert.equal(cleanPrice({}), null);
});

test('cleanPrice: warns when parsing a string', () => {
  const warns = [];
  const orig = console.warn;
  console.warn = (...args) => warns.push(args.join(' '));
  try {
    cleanPrice('$178.490');
    cleanPrice('522390');
    cleanPrice('abc');
    assert.ok(warns.length === 3, 'expected 3 warnings for 3 string inputs');
    assert.ok(warns[0].includes('[metaPixel]'));
  } finally {
    console.warn = orig;
  }
});

test('cleanPrice: negative values', () => {
  assert.equal(cleanPrice('-178.490'), -178490);
  assert.equal(cleanPrice(-178490), -178490);
  assert.equal(cleanPrice('-$ 522.390,00'), -522390);
});

test('cleanPrice: ambiguous single-dot formats', () => {
  // Argentine: dot with 3 trailing digits == thousands separator.
  assert.equal(cleanPrice('1.000'), 1000);
  // Single dot with non-3 trailing digits is treated as decimal.
  assert.equal(cleanPrice('1.5'), 2);
  assert.equal(cleanPrice('1.50'), 2);
  // Comma-only is always decimal.
  assert.equal(cleanPrice('1,5'), 2);
  assert.equal(cleanPrice('1,50'), 2);
});

function withFakeFbq(t, run) {
  const calls = [];
  const originalWindow = global.window;
  global.window = { fbq: (...args) => calls.push(args) };
  try {
    return run(calls);
  } finally {
    if (originalWindow === undefined) {
      delete global.window;
    } else {
      global.window = originalWindow;
    }
  }
}

async function withFakeFbqAsync(t, run) {
  const calls = [];
  const originalWindow = global.window;
  global.window = { fbq: (...args) => calls.push(args) };
  try {
    await run(calls);
  } finally {
    if (originalWindow === undefined) {
      delete global.window;
    } else {
      global.window = originalWindow;
    }
  }
}

test('trackStandard: forwards to fbq with default ARS currency', () => {
  withFakeFbq(null, calls => {
    trackStandard('Purchase', { value: 178490, content_type: 'product' });
    assert.deepEqual(calls, [
      ['track', 'Purchase', { currency: 'ARS', value: 178490, content_type: 'product' }],
    ]);
  });
});

test('trackStandard: passes eventID for CAPI deduplication', () => {
  withFakeFbq(null, calls => {
    trackStandard(
      'Purchase',
      { value: 100, order_id: 'abc' },
      { eventID: 'purchase_abc' }
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0][3].eventID, 'purchase_abc');
  });
});

test('trackStandard: overriding currency is respected', () => {
  withFakeFbq(null, calls => {
    trackStandard('AddToCart', { value: 10, currency: 'USD' });
    assert.equal(calls[0][2].currency, 'USD');
  });
});

test('trackStandard: can omit default currency for non-monetary events', () => {
  withFakeFbq(null, calls => {
    trackStandard('CompleteRegistration', { status: true }, { includeCurrency: false });
    assert.deepEqual(calls, [['track', 'CompleteRegistration', { status: true }]]);
  });
});

test('trackStandard: strips undefined, null, and NaN from payload', () => {
  withFakeFbq(null, calls => {
    trackStandard('AddToCart', { value: 178490, content_name: undefined, bad: NaN, empty: null });
    const payload = calls[0][2];
    assert.equal(payload.value, 178490);
    assert.ok(!('content_name' in payload), 'undefined field should be stripped');
    assert.ok(!('bad' in payload), 'NaN field should be stripped');
    assert.ok(!('empty' in payload), 'null field should be stripped');
  });
});

test('filterPayload: removes undefined, null, NaN; keeps 0 and valid strings', () => {
  const result = filterPayload({ a: 1, b: undefined, c: null, d: NaN, e: 0, f: 'ok', g: false });
  assert.deepEqual(result, { a: 1, e: 0, f: 'ok', g: false });
});

test('trackStandard / trackCustom: silent no-op when fbq absent', () => {
  const originalWindow = global.window;
  global.window = {};
  try {
    assert.doesNotThrow(() => trackStandard('Purchase', { value: 1 }));
    assert.doesNotThrow(() => trackCustom('CartView', { value: 1 }));
  } finally {
    if (originalWindow === undefined) delete global.window;
    else global.window = originalWindow;
  }
});

test('trackCustom: forwards event name and payload', () => {
  withFakeFbq(null, calls => {
    trackCustom('CartView', { value: 1000, num_items: 2 });
    assert.deepEqual(calls, [['trackCustom', 'CartView', { value: 1000, num_items: 2 }]]);
  });
});

test('trackCustom: omits payload arg when empty', () => {
  withFakeFbq(null, calls => {
    trackCustom('HomeView');
    assert.deepEqual(calls, [['trackCustom', 'HomeView']]);
  });
});

test('trackCustom: strips undefined, null, and NaN from payload', () => {
  withFakeFbq(null, calls => {
    trackCustom('CartView', { num_items: 3, bad: undefined, empty: null, notNum: NaN });
    assert.equal(calls.length, 1);
    const payload = calls[0][2];
    assert.equal(payload.num_items, 3);
    assert.ok(!('bad' in payload), 'undefined field should be stripped');
    assert.ok(!('empty' in payload), 'null field should be stripped');
    assert.ok(!('notNum' in payload), 'NaN field should be stripped');
  });
});

test('trackCustom: omits payload arg when all fields are stripped', () => {
  withFakeFbq(null, calls => {
    trackCustom('SomeEvent', { a: undefined, b: null });
    assert.deepEqual(calls, [['trackCustom', 'SomeEvent']]);
  });
});

test('sha256Hex: matches node:crypto for canonical inputs', async () => {
  assert.equal(await sha256Hex('foo@example.com'), expectedSha256('foo@example.com'));
  assert.equal(await sha256Hex(''), expectedSha256(''));
});

test('initWithEmail: lowercases, trims, and sha256-hashes before fbq init', async () => {
  await withFakeFbqAsync(null, async calls => {
    await initWithEmail('  Foo@Example.COM  ');
    assert.deepEqual(calls, [
      ['init', '2190799084462246', { em: expectedSha256('foo@example.com') }],
    ]);
  });
});

test('initWithEmail: ignored when email is empty / invalid', async () => {
  await withFakeFbqAsync(null, async calls => {
    await initWithEmail('');
    await initWithEmail(null);
    await initWithEmail(undefined);
    await initWithEmail('   ');
    await initWithEmail(123);
    assert.deepEqual(calls, []);
  });
});
