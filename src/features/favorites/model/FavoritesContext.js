/**
 * @fileoverview Состояние списка избранного, получаемого из Laravel API.
 * `FavoritesProvider` монтируется в `src/app/providers.jsx`; внутри приложения
 * используйте `useFavorites()` для проверки/переключения избранного и перечня ID.
 * При авторизации список загружается с API; при переключении аккаунта провайдер
 * перемонтируется, чтобы данные одного пользователя не попали в другой аккаунт.
 * @example
 * const { isFavorite, toggleFavorite } = useFavorites();
 * const saved = isFavorite(tea.id);
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/shared/api/api';
import { useAuth } from '@/features/auth/model/AuthContexts';

const FavoritesContext = createContext(null);

/** @param {{children: import('react').ReactNode}} props Компоненты, использующие избранное. */
export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/favorites');
      setFavorites(res.data.favorites || []);
      setFavoriteIds(res.data.ids || []);
    } catch {
      setFavorites([]);
      setFavoriteIds([]);
      setError('Не удалось загрузить избранное.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let active = true;

    api.get('/favorites')
      .then((res) => {
        if (!active) return;
        setFavorites(res.data.favorites || []);
        setFavoriteIds(res.data.ids || []);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setFavorites([]);
        setFavoriteIds([]);
        setError('РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РёР·Р±СЂР°РЅРЅРѕРµ.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  /** Проверяет, находится ли товар в избранном текущего пользователя. */
  const isFavorite = useCallback((teaId) => (
    favoriteIds.includes(Number(teaId))
  ), [favoriteIds]);

  /** Добавляет товар в избранное или удаляет его; возвращает новое состояние. */
  const toggleFavorite = useCallback(async (tea) => {
    const teaId = Number(tea.id);

    if (isFavorite(teaId)) {
      await api.delete(`/favorites/${teaId}`);
      setFavoriteIds((ids) => ids.filter((id) => id !== teaId));
      setFavorites((items) => items.filter((item) => Number(item.id) !== teaId));
      return false;
    }

    await api.post(`/favorites/${teaId}`);
    setFavoriteIds((ids) => [...new Set([...ids, teaId])]);
    setFavorites((items) => (
      items.some((item) => Number(item.id) === teaId) ? items : [tea, ...items]
    ));
    return true;
  }, [isFavorite]);

  const value = useMemo(() => ({
    favorites,
    favoriteIds,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    reloadFavorites: loadFavorites,
  }), [favorites, favoriteIds, loading, error, isFavorite, toggleFavorite, loadFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

/**
 * Возвращает список избранного, статус загрузки и операции над ним.
 * @throws {Error} Если хук вызван вне FavoritesProvider.
 * @example const { favorites, toggleFavorite } = useFavorites();
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }

  return context;
};
