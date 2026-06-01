import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tea_cart';
const DEFAULT_WEIGHT = 100;

const normalizeTea = (tea, weight = DEFAULT_WEIGHT) => {
  const selectedWeight = Number(weight) || DEFAULT_WEIGHT;
  const pricePer100 = Number(tea.price) || 0;

  return {
    id: tea.id,
    cartKey: `${tea.id}-${selectedWeight}`,
    name: tea.name,
    slug: tea.slug,
    price: pricePer100,
    linePrice: Math.round(pricePer100 * (selectedWeight / 100)),
    weight: selectedWeight,
    image: tea.image || '/placeholder.jpg',
    category: tea.category || null,
  };
};

const migrateCartItem = (item) => {
  const weight = Number(item.weight) || DEFAULT_WEIGHT;
  const price = Number(item.price) || 0;

  return {
    ...item,
    cartKey: item.cartKey || `${item.id}-${weight}`,
    weight,
    price,
    linePrice: Number(item.linePrice) || Math.round(price * (weight / 100)),
    quantity: Number(item.quantity) || 1,
  };
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      return Array.isArray(parsedCart) ? parsedCart.map(migrateCartItem) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (tea, weight = DEFAULT_WEIGHT) => {
    const cartTea = normalizeTea(tea, weight);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartKey === cartTea.cartKey);

      if (existingItem) {
        return currentItems.map((item) => (
          item.cartKey === cartTea.cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }

      return [...currentItems, { ...cartTea, quantity: 1 }];
    });
  };

  const updateQuantity = (cartKey, quantity) => {
    const nextQuantity = Number(quantity);

    setItems((currentItems) => currentItems
      .map((item) => (
        item.cartKey === cartKey
          ? { ...item, quantity: Math.max(1, nextQuantity || 1) }
          : item
      )));
  };

  const incrementItem = (cartKey) => {
    setItems((currentItems) => currentItems.map((item) => (
      item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
    )));
  };

  const decrementItem = (cartKey) => {
    setItems((currentItems) => currentItems
      .map((item) => (
        item.cartKey === cartKey ? { ...item, quantity: item.quantity - 1 } : item
      ))
      .filter((item) => item.quantity > 0));
  };

  const removeItem = (cartKey) => {
    setItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.linePrice * item.quantity, 0);

    return {
      items,
      totalQuantity,
      totalWeight,
      totalPrice,
      addItem,
      updateQuantity,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    };
  }, [items]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
};
