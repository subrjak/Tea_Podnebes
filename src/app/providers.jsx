/**
 * @fileoverview Собирает глобальные клиентские провайдеры приложения.
 * Используется один раз корневым `src/app/layout.js`; новые глобальные контексты
 * подключайте здесь, соблюдая зависимости: FavoritesProvider использует AuthProvider.
 * AccountProviders получает ID текущего пользователя и перемонтирует избранное
 * при смене аккаунта.
 * @example <Providers>{children}</Providers>
 */
'use client';

import { AuthProvider, useAuth } from '@/features/auth/model/AuthContexts';
import { CartProvider } from '@/features/cart/model/CartContext';
import { FavoritesProvider } from '@/features/favorites/model/FavoritesContext';

function AccountProviders({ children }) {
  const { user } = useAuth();

  return <FavoritesProvider key={user?.id || 'anonymous'}>{children}</FavoritesProvider>;
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <AccountProviders>{children}</AccountProviders>
      </CartProvider>
    </AuthProvider>
  );
}
