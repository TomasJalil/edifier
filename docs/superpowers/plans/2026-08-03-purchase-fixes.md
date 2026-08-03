# Purchase Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the transient home-delivery quote label and prevent purchase actions when publication availability requires `AVISAME`.

**Architecture:** Add pure purchase-state decisions in a focused utility and consume them from the existing Vue components. Keep API calls, stock calculation, and checkout structure unchanged.

**Tech Stack:** Vue 2, Vuetify 2, CommonJS utilities, Node `node:test`.

## Global Constraints

- The pending home-delivery label is exactly `Calculando`.
- `Gratis` is displayed only after a successful zero-value quote.
- Purchase actions require both general stock and a valid warehouse threshold.
- Do not refactor unrelated checkout or tracking behavior.

---

### Task 1: Purchase-state decisions

**Files:**
- Create: `src/utils/purchaseState.js`
- Create: `tests/purchaseState.test.cjs`

**Interfaces:**
- Produces: `getShippingQuoteState({ deliveryMethod, loading, resolved, quote, error }): string`
- Produces: `canPurchasePublication(dataProduct, hasValidThreshold): boolean`

- [ ] **Step 1: Write failing tests** for a stale free quote while loading, a confirmed zero quote, stock without threshold, and stock with threshold.
- [ ] **Step 2: Run `node --test tests/purchaseState.test.cjs`** and verify failure because the utility does not exist.
- [ ] **Step 3: Implement the minimal pure functions** with loading precedence and a strict stock-plus-threshold condition.
- [ ] **Step 4: Run `node --test tests/purchaseState.test.cjs`** and verify all new tests pass.

### Task 2: Wire the quote state into checkout

**Files:**
- Modify: `src/components/cart/Cart.vue`
- Test: `tests/purchaseState.test.cjs`

**Interfaces:**
- Consumes: `getShippingQuoteState(...)` from Task 1.

- [ ] **Step 1: Select delivery through one method** that clears stale quote state before requesting a new quote.
- [ ] **Step 2: Render `Calculando`, `Gratis`, price, or fallback** from the pure quote state in both checkout summaries.
- [ ] **Step 3: Mark a quote resolved only after successful API/free-shipping completion**, never from `finally` after an early return or error.
- [ ] **Step 4: Run `npm test`** and verify the suite passes.

### Task 3: Wire the purchase availability into publication actions

**Files:**
- Modify: `src/components/views/ProductDetails.vue`
- Modify: `src/components/Utils/informationCP.vue`
- Test: `tests/purchaseState.test.cjs`

**Interfaces:**
- Consumes: `canPurchasePublication(dataProduct, hasValidThreshold)` from Task 1.

- [ ] **Step 1: Use one `canPurchase()` decision** for quantity controls and purchase-action rendering.
- [ ] **Step 2: Guard buy-now and add-to-cart handlers** with the same decision.
- [ ] **Step 3: Run `npm test` and `npm run build`** and verify both succeed.
- [ ] **Step 4: Review `git diff --check` and the final diff** for unrelated changes.
