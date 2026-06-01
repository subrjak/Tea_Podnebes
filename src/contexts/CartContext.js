import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tea_cart';

const normalizeTea = (tea) => ({
  id: tea.id,
  name: tea.name,
  slug: tea.slug,
  price: Number(tea.price) || 0,
  image: tea.image || '/placeholder.jpg',
  category: tea.category || null,
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (tea) => {
    const cartTea = normalizeTea(tea);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === cartTea.id);

      if (existingItem) {
        return currentItems.map((item) => (
          item.id === cartTea.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }

      return [...currentItems, { ...cartTea, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    const nextQuantity = Number(quantity);

    setItems((currentItems) => currentItems
      .map((item) => (
        item.id === id
          ? { ...item, quantity: Math.max(1, nextQuantity || 1) }
          : item
      )));
  };

  const incrementItem = (id) => {
    setItems((currentItems) => currentItems.map((item) => (
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    )));
  };

  const decrementItem = (id) => {
    setItems((currentItems) => currentItems
      .map((item) => (
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      ))
      .filter((item) => item.quantity > 0));
  };

  const removeItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      totalQuantity,
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
