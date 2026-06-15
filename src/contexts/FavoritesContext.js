import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContexts';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds([]);
      return;
    }

    setLoading(true);

    try {
      const res = await api.get('/favorites');
      setFavorites(res.data.favorites || []);
      setFavoriteIds(res.data.ids || []);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback((teaId) => (
    favoriteIds.includes(Number(teaId))
  ), [favoriteIds]);

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
    isFavorite,
    toggleFavorite,
    reloadFavorites: loadFavorites,
  }), [favorites, favoriteIds, loading, isFavorite, toggleFavorite, loadFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }

  return context;
};
