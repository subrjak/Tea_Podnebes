export const BASE_TEA_WEIGHTS = [25, 50, 100, 200];
export const PRESSED_TEA_WEIGHT = 357;
export const COIN_TEA_WEIGHT = 5;

const PRESSED_TEA_NAMES = ['шу пуэр', 'шоу мэй', 'габа шен пуэр'];
const PRESSED_TEA_SLUGS = ['shu-puer', 'shou-mei', 'gaba-sheng-puer-cake', 'shu-puer-cake'];
const COIN_TEA_SLUGS = ['puer-coins-5g'];

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

export const isTeaCoin = (tea) => {
  const slug = tea?.slug?.toLowerCase() || '';
  return COIN_TEA_SLUGS.includes(slug);
};

export const getTeaWeightOptions = (tea) => {
  if (isTeaCoin(tea)) {
    return [COIN_TEA_WEIGHT];
  }

  if (isPressedTea(tea)) {
    return [...BASE_TEA_WEIGHTS, PRESSED_TEA_WEIGHT];
  }

  return BASE_TEA_WEIGHTS;
};

export const getWeightLabel = (weight) => (
  Number(weight) === COIN_TEA_WEIGHT
    ? '5 г монета'
    : (Number(weight) === PRESSED_TEA_WEIGHT ? '357 г блин' : `${weight} г`)
);

export const getWeightPrice = (pricePer100, weight) => (
  Math.round((Number(pricePer100) || 0) * (Number(weight) / 100))
);
