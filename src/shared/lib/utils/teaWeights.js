/**
 * @fileoverview Общие правила фасовки чая, подписи веса и расчёта цены.
 * Используйте эти функции в карточках, деталях товара и корзине, чтобы
 * варианты веса и цены рассчитывались одинаково.
 * @example
 * const options = getTeaWeightOptions(tea);
 * const price = getWeightPrice(tea.price, options[0]);
 */

/** Стандартные варианты веса для рассыпного чая, в граммах. */
export const BASE_TEA_WEIGHTS = [25, 50, 100, 200];
export const PRESSED_TEA_WEIGHT = 357;
export const COIN_TEA_WEIGHT = 5;
export const COIN_TEA_COUNTS = [1, 2, 3, 5, 10];

const PRESSED_TEA_NAMES = ['шу пуэр', 'шоу мэй', 'габа шен пуэр'];
const PRESSED_TEA_SLUGS = ['shu-puer', 'shou-mei', 'gaba-sheng-puer-cake', 'shu-puer-cake'];
const COIN_TEA_SLUGS = ['puer-coins-5g'];

/**
 * Проверяет по названию, категории или slug, продаётся ли чай прессованным блином.
 * Для такого чая добавляется специальный вес 357 г.
 * @param {object|null} tea Товар API с полями name, slug и category.
 * @returns {boolean} `true`, если чай относится к прессованным.
 * @example isPressedTea(tea);
 */
export const isPressedTea = (tea) => {
  const name = tea?.name?.toLowerCase() || '';
  const categoryName = tea?.category?.name?.toLowerCase() || '';
  const slug = tea?.slug?.toLowerCase() || '';
  const categorySlug = tea?.category?.slug?.toLowerCase() || '';

  return PRESSED_TEA_SLUGS.includes(slug)
    || PRESSED_TEA_NAMES.some((pressedName) => (
    name.includes(pressedName)
    || categoryName.includes(pressedName)
    || categorySlug.includes(pressedName.replace(' ', '-'))
  ));
};

/**
 * Проверяет, является ли товар чайными монетами по его slug.
 * @param {object|null} tea Товар API.
 * @returns {boolean} `true` для чая-монет.
 * @example isTeaCoin(tea);
 */
export const isTeaCoin = (tea) => {
  const slug = tea?.slug?.toLowerCase() || '';
  return COIN_TEA_SLUGS.includes(slug);
};

/**
 * Возвращает доступные варианты покупки для товара в граммах.
 * Для монет варианты задаются количеством монет, умноженным на их вес.
 * @param {object|null} tea Товар API.
 * @returns {number[]} Варианты веса в граммах.
 * @example getTeaWeightOptions(tea); // [25, 50, 100, 200]
 */
export const getTeaWeightOptions = (tea) => {
  if (isTeaCoin(tea)) {
    return COIN_TEA_COUNTS.map((count) => count * COIN_TEA_WEIGHT);
  }

  if (isPressedTea(tea)) {
    return [...BASE_TEA_WEIGHTS, PRESSED_TEA_WEIGHT];
  }

  return BASE_TEA_WEIGHTS;
};

const getCoinNoun = (count) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'монет';
  if (lastDigit === 1) return 'монета';
  if (lastDigit >= 2 && lastDigit <= 4) return 'монеты';
  return 'монет';
};

/**
 * Формирует подпись выбранного веса для интерфейса.
 * Для чая-монет выводит количество монет, для блина 357 г — специальную подпись.
 * @param {number|string} weight Вес в граммах.
 * @param {object|null} [tea=null] Товар; помогает распознать монеты.
 * @returns {string} Подпись для пользователя.
 * @example getWeightLabel(100, tea); // '100 г'
 */
export const getWeightLabel = (weight, tea = null) => {
  const numericWeight = Number(weight);

  if (isTeaCoin(tea) || (!tea && numericWeight === COIN_TEA_WEIGHT)) {
    const coinCount = Math.max(1, numericWeight / COIN_TEA_WEIGHT);
    return `${coinCount} ${getCoinNoun(coinCount)}`;
  }

  return numericWeight === PRESSED_TEA_WEIGHT ? '357 г блин' : `${weight} г`;
};

/**
 * Считает цену выбранного веса пропорционально цене за 100 г.
 * @param {number|string} pricePer100 Цена 100 г в тенге.
 * @param {number|string} weight Выбранный вес в граммах.
 * @returns {number} Цена, округлённая до целого тенге.
 * @example getWeightPrice(1200, 50); // 600
 */
export const getWeightPrice = (pricePer100, weight) => (
  Math.round((Number(pricePer100) || 0) * (Number(weight) / 100))
);
