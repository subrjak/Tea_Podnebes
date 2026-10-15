/**
 * @fileoverview Клиентская защита страницы, доступной только вошедшим пользователям.
 * Оберните этим компонентом содержимое маршрута в `src/app`, если для него
 * требуется активная учётная запись. Проверка API/данных всё равно должна быть
 * реализована на сервере.
 * @example <PrivateRoute><ProfilePage /></PrivateRoute>
 * Во время восстановления сессии показывает статус, затем сохраняет URL
 * в `next` и перенаправляет гостя на страницу входа.
 */
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/model/AuthContexts';

/** @param {{children: import('react').ReactNode}} props Защищаемое содержимое. */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [initializing, isAuthenticated, pathname, router]);

  if (initializing) {
    return <div className="auth-status">Проверяем профиль...</div>;
  }

  if (!isAuthenticated) {
    return <div className="auth-status">Перенаправляем на страницу входа...</div>;
  }

  return children;
};

export default PrivateRoute;
