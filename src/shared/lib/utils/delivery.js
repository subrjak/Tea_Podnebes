/**
 * @fileoverview Расчёт стоимости доставки и суммы до бесплатной доставки.
 * Используйте эти функции в корзине и оформлении заказа, чтобы порог и тариф
 * оставались одинаковыми во всём интерфейсе.
 * @example
 * const delivery = getDeliveryPrice(cartTotal);
 * const remaining = getFreeDeliveryRemaining(cartTotal);
 */

/** Базовая стоимость доставки в тенге, пока заказ не достиг порога. */
export const DELIVERY_PRICE = 1000;
/** Минимальная сумма заказа в тенге для бесплатной доставки. */
export const FREE_DELIVERY_THRESHOLD = 6000;

/**
 * Возвращает стоимость доставки для указанной суммы заказа.
 * @param {number|string} orderTotal Сумма товаров в тенге.
 * @returns {number} 0 от порога бесплатной доставки, иначе DELIVERY_PRICE.
 * @example getDeliveryPrice(6500); // 0
 */
export const getDeliveryPrice = (orderTotal) => (
  Number(orderTotal) >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_PRICE
);

/**
 * Возвращает, сколько тенге осталось до бесплатной доставки.
 * Отрицательный остаток ограничивается нулём.
 * @param {number|string} orderTotal Сумма товаров в тенге.
 * @returns {number} Неотрицательная сумма до порога.
 * @example getFreeDeliveryRemaining(4500); // 1500
 */
export const getFreeDeliveryRemaining = (orderTotal) => (
  Math.max(0, FREE_DELIVERY_THRESHOLD - Number(orderTotal || 0))
);
