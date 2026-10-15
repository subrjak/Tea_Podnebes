/**
 * @fileoverview Состояние авторизации приложения и хук доступа к нему.
 * Подключите `AuthProvider` один раз в `src/app/providers.jsx`; в клиентских
 * компонентах используйте `useAuth()` для пользователя и методов входа/выхода.
 * При запуске провайдер проверяет HttpOnly-сессию через `/me`, а затем
 * предоставляет компонента́м актуального пользователя и состояние инициализации.
 * @example
 * const { user, login, logout, initializing } = useAuth();
 */
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/shared/api/api';

const AuthContext = createContext(null);

/** @param {{children: import('react').ReactNode}} props Всё приложение внутри авторизации. */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    api.get('/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setInitializing(false));
  }, []);

  const refreshUser = async () => {
    const res = await api.get('/me');
    setUser(res.data.user);
    return res.data.user;
  };

  const login = async (credentials) => {
    const res = await api.post('/login', credentials);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/register', data);
    setUser(res.data.user);
    return res.data.user;
  };

  const updateProfile = async (data) => {
    const res = await api.put('/profile', data);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    initializing,
    isAuthenticated: Boolean(user),
    login,
    register,
    updateProfile,
    refreshUser,
    logout,
  }), [user, initializing]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Возвращает состояние и методы AuthProvider.
 * @returns {{user: object|null, initializing: boolean, isAuthenticated: boolean, login: Function, register: Function, updateProfile: Function, refreshUser: Function, logout: Function}}
 * @throws {Error} Если хук вызван вне AuthProvider.
 * @example const { isAuthenticated, user } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
