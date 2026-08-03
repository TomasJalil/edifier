function getShippingQuoteState({
  deliveryMethod,
  loading,
  resolved,
  quote,
  error
}) {
  if (deliveryMethod !== 1) return "hidden";
  if (loading) return "calculating";
  if (error || !resolved) return "pending";
  if (Number(quote) === 0) return "free";
  return "price";
}

function canPurchasePublication(dataProduct, hasValidThreshold) {
  const warehouses = dataProduct?.product?.product_warehouse;
  const hasStock =
    Array.isArray(warehouses) &&
    warehouses.some(warehouse => warehouse.current_stock !== 0);

  return Boolean(
    hasStock &&
      !dataProduct?.store?.out_stock &&
      !dataProduct?.out_stock &&
      hasValidThreshold
  );
}

module.exports = {
  getShippingQuoteState,
  canPurchasePublication
};
