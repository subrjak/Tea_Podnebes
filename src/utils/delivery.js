export const DELIVERY_PRICE = 1000;
export const FREE_DELIVERY_THRESHOLD = 6000;

export const getDeliveryPrice = (orderTotal) => (
  Number(orderTotal) >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_PRICE
);

export const getFreeDeliveryRemaining = (orderTotal) => (
  Math.max(0, FREE_DELIVERY_THRESHOLD - Number(orderTotal || 0))
);
