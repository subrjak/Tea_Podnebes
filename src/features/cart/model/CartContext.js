/**
 * @fileoverview Корзина и её синхронизация с localStorage между вкладками.
 * Подключите `CartProvider` в `src/app/providers.jsx`. В компонентах используйте
 * `useCart()` для чтения товаров/итогов и для добавления или изменения позиций.
 * Снимок синхронизируется через `useSyncExternalStore`, поэтому серверный и
 * первый клиентский рендер совпадают; подписчики получают обновления при записи.
 * @example
 * const { items, totalPrice, addItem } = useCart();
 * const result = addItem(tea, 100);
 */
'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tea_cart';
const EMPTY_CART = '[]';
let memorySnapshot;
const listeners = new Set();

const normalizeTea = (tea, weight = 100) => {
  const selectedWeight = Number(weight) || 100;
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
    stock: Math.max(0, Number(tea.stock) || 0),
  };
};

const migrateCartItem = (item) => {
  const weight = Number(item.weight) || 100;
  const price = Number(item.price) || 0;

  return {
    ...item,
    cartKey: item.cartKey || `${item.id}-${weight}`,
    weight,
    price,
    linePrice: Number(item.linePrice) || Math.round(price * (weight / 100)),
    quantity: Number(item.quantity) || 1,
    stock: Math.max(0, Number(item.stock) || 0),
  };
};

const parseCart = (snapshot) => {
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(migrateCartItem) : [];
  } catch {
    return [];
  }
};

const getSnapshot = () => {
  if (typeof window === 'undefined') return EMPTY_CART;
  if (memorySnapshot !== undefined) return memorySnapshot;

  try {
    memorySnapshot = window.localStorage.getItem(STORAGE_KEY) || EMPTY_CART;
  } catch {
    memorySnapshot = EMPTY_CART;
  }

  return memorySnapshot;
};

const subscribe = (listener) => {
  if (typeof window === 'undefined') return () => {};
  listeners.add(listener);

  const handleStorage = (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    memorySnapshot = event.newValue || EMPTY_CART;
    listeners.forEach((notify) => notify());
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
};

const getServerSnapshot = () => EMPTY_CART;

const saveCart = (items) => {
  memorySnapshot = JSON.stringify(items);

  try {
    window.localStorage.setItem(STORAGE_KEY, memorySnapshot);
  } catch {
    // Keep the in-memory cart usable when browser storage is unavailable.
  }

  listeners.forEach((notify) => notify());
};

const getTeaWeightInCart = (items, teaId) => (
  items
    .filter((item) => item.id === teaId)
    .reduce((sum, item) => sum + item.weight * item.quantity, 0)
);

/** @param {{children: import('react').ReactNode}} props Дерево компонентов с корзиной. */
export const CartProvider = ({ children }) => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parseCart(snapshot), [snapshot]);

  const commitItems = useCallback((update) => {
    const currentItems = parseCart(getSnapshot());
    const nextItems = typeof update === 'function' ? update(currentItems) : update;
    saveCart(nextItems);
  }, []);

  /** Добавляет фасовку, если общий вес этого чая не превышает остаток. */
  const addItem = useCallback((tea, weight = 100) => {
    const cartTea = normalizeTea(tea, weight);
    const currentItems = parseCart(getSnapshot());
    const currentTeaWeight = getTeaWeightInCart(currentItems, cartTea.id);

    if (currentTeaWeight + cartTea.weight > cartTea.stock) {
      return {
        ok: false,
        message: cartTea.stock > 0
          ? `На складе доступно ${cartTea.stock} г.`
          : 'Товара сейчас нет на складе.',
      };
    }

    commitItems((itemsInCart) => {
      const existingItem = itemsInCart.find((item) => item.cartKey === cartTea.cartKey);

      if (existingItem) {
        return itemsInCart.map((item) => (
          item.cartKey === cartTea.cartKey
            ? { ...item, quantity: item.quantity + 1, stock: cartTea.stock }
            : item
        ));
      }

      return [...itemsInCart, { ...cartTea, quantity: 1 }];
    });

    return { ok: true };
  }, [commitItems]);

  const updateQuantity = useCallback((cartKey, quantity) => {
    const nextQuantity = Number(quantity);

    commitItems((currentItems) => {
      const targetItem = currentItems.find((item) => item.cartKey === cartKey);
      if (!targetItem) return currentItems;

      const otherQuantity = currentItems
        .filter((item) => item.id === targetItem.id && item.cartKey !== cartKey)
        .reduce((sum, item) => sum + item.weight * item.quantity, 0);
      const availableForItem = Math.floor(Math.max(0, targetItem.stock - otherQuantity) / targetItem.weight);

      return currentItems
        .map((item) => (
          item.cartKey === cartKey
            ? { ...item, quantity: Math.max(0, Math.min(Math.max(1, nextQuantity || 1), availableForItem)) }
            : item
        ))
        .filter((item) => item.quantity > 0);
    });
  }, [commitItems]);

  const incrementItem = useCallback((cartKey) => {
    commitItems((currentItems) => {
      const targetItem = currentItems.find((item) => item.cartKey === cartKey);
      if (!targetItem) return currentItems;

      const currentTeaWeight = getTeaWeightInCart(currentItems, targetItem.id);
      if (currentTeaWeight + targetItem.weight > targetItem.stock) return currentItems;

      return currentItems.map((item) => (
        item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
      ));
    });
  }, [commitItems]);

  const decrementItem = useCallback((cartKey) => {
    commitItems((currentItems) => currentItems
      .map((item) => (
        item.cartKey === cartKey ? { ...item, quantity: item.quantity - 1 } : item
      ))
      .filter((item) => item.quantity > 0));
  }, [commitItems]);

  const removeItem = useCallback((cartKey) => {
    commitItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
  }, [commitItems]);

  const clearCart = useCallback(() => commitItems([]), [commitItems]);

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
  }, [items, addItem, updateQuantity, incrementItem, decrementItem, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Возвращает позиции корзины, суммы и операции изменения.
 * @throws {Error} Если хук вызван вне CartProvider.
 * @example const { items, incrementItem, removeItem } = useCart();
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};
