/**
 * @fileoverview Клиентская проверка доступа к административным страницам.
 * Используйте как обёртку в маршрутах `src/app/admin`. По умолчанию требуется
 * право admin; для склада можно передать `inventoryOnly`. Laravel API обязан
 * отдельно проверять разрешения каждого запроса.
 * @example <AdminRoute><AdminDashboardPage /></AdminRoute>
 * @example <AdminRoute inventoryOnly><AdminTeasPage /></AdminRoute>
 * Компонент ждёт восстановления сессии и затем показывает страницу или
 * перенаправляет пользователя на вход/в профиль.
 */
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/AuthContexts';

const hasInventoryAccess = (user) => {
  if (user?.permissions?.inventory) return true;

  const status = (user?.admin_status || '').toLowerCase();
  return status.includes('админ') || status.includes('владелец') || status.includes('заведующий складом');
};

/**
 * @param {{children: import('react').ReactNode, inventoryOnly?: boolean}} props
 * Содержимое и необязательный режим доступа только к инвентарю.
 */
const AdminRoute = ({ children, inventoryOnly = false }) => {
  const { isAuthenticated, initializing, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const canOpenAdmin = user?.permissions?.admin || user?.is_admin;
  const allowed = inventoryOnly ? hasInventoryAccess(user) : canOpenAdmin;

  useEffect(() => {
    if (initializing) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!allowed) {
      router.replace('/profile');
    }
  }, [initializing, isAuthenticated, allowed, pathname, router]);

  if (initializing) {
    return <div className="auth-status">Проверяем права администратора...</div>;
  }

  if (!isAuthenticated) {
    return <div className="auth-status">Перенаправляем на страницу входа...</div>;
  }

  if (!allowed) {
    return <div className="auth-status">Перенаправляем в профиль...</div>;
  }

  return children;
};

export default AdminRoute;
