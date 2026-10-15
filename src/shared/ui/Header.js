/**
 * @fileoverview Общая шапка сайта: навигация, корзина, профиль и выход.
 * Подключена в корневом `src/app/layout.js`; повторно на страницах её добавлять
 * не нужно. Ссылки ведут через `next/link`, активный раздел определяется по URL.
 * @example <Header /> // Уже размещён в RootLayout.
 * Пункты админки отображаются по разрешениям пользователя из AuthContext.
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/AuthContexts';
import { useCart } from '@/features/cart/model/CartContext';

/** Общая навигация и меню учётной записи, используемые на всех страницах. */
function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const adminStatus = (user?.admin_status || '').toLowerCase();
  const canOpenAdmin = user?.permissions?.admin || user?.is_admin;
  const canManageTeas = user?.permissions?.inventory
    || adminStatus.includes('админ')
    || adminStatus.includes('владелец')
    || adminStatus.includes('заведующий складом');

  const activeClass = (href) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)) ? 'active' : undefined;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeMenu = () => {
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsLogoutConfirmOpen(false);
    closeMenu();
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <Link className="logo" href="/" aria-current={pathname === '/' ? 'page' : undefined}>Лист Поднебесной</Link>

        <nav className="nav">
          <Link href="/" className={activeClass('/')}>Главная</Link>
          <Link href="/catalog" className={activeClass('/catalog')}>Каталог</Link>
          <Link href="/blog" className={activeClass('/blog')}>Блог</Link>
          <Link className={`cart-link ${activeClass('/cart') || ''}`} href="/cart">
            Корзина
            {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
          </Link>
          {canOpenAdmin && <Link href="/admin" className={activeClass('/admin')}>Админ</Link>}
          {!canOpenAdmin && canManageTeas && <Link href="/admin/teas" className={activeClass('/admin/teas')}>Склад</Link>}
        </nav>

        <div className="profile-menu" ref={menuRef}>
          <button
            className={`profile ${isProfileMenuOpen ? 'is-open' : ''}`}
            type="button"
            aria-label="Профиль"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
          >
            <svg width="38" height="38" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M13 11.375C13 9.65109 13.6848 7.99779 14.9038 6.77881C16.1228 5.55982 17.7761 4.875 19.5 4.875C21.2239 4.875 22.8772 5.55982 24.0962 6.77881C25.3152 7.99779 26 9.65109 26 11.375C26 13.0989 25.3152 14.7522 24.0962 15.9712C22.8772 17.1902 21.2239 17.875 19.5 17.875C17.7761 17.875 16.1228 17.1902 14.9038 15.9712C13.6848 14.7522 13 13.0989 13 11.375ZM13 21.125C10.8451 21.125 8.77849 21.981 7.25476 23.5048C5.73102 25.0285 4.875 27.0951 4.875 29.25C4.875 30.5429 5.38861 31.7829 6.30285 32.6971C7.21709 33.6114 8.45707 34.125 9.75 34.125H29.25C30.5429 34.125 31.7829 33.6114 32.6971 32.6971C33.6114 31.7829 34.125 30.5429 34.125 29.25C34.125 27.0951 33.269 25.0285 31.7452 23.5048C30.2215 21.981 28.1549 21.125 26 21.125H13Z" fill="currentColor" />
            </svg>
            <span>{isAuthenticated ? user?.name : 'Профиль'}</span>
          </button>

          {isProfileMenuOpen && (
            <div className="profile-dropdown" role="menu">
              {isAuthenticated ? (
                <>
                  <div className="profile-dropdown__user">
                    <strong>{user?.name}</strong>
                    <span>{user?.admin_status || user?.email}</span>
                  </div>
                  <Link href="/profile" role="menuitem" onClick={closeMenu}>
                    Личный кабинет
                  </Link>
                  {canOpenAdmin && (
                    <Link href="/admin" role="menuitem" onClick={closeMenu}>
                      Админ-панель
                    </Link>
                  )}
                  {!canOpenAdmin && canManageTeas && (
                    <Link href="/admin/teas" role="menuitem" onClick={closeMenu}>
                      Управление складом
                    </Link>
                  )}
                  <button type="button" role="menuitem" onClick={() => setIsLogoutConfirmOpen(true)}>
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" role="menuitem" onClick={closeMenu}>
                    Войти в аккаунт
                  </Link>
                  <Link href="/register" role="menuitem" onClick={closeMenu}>
                    Зарегистрироваться
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isLogoutConfirmOpen && (
        <div className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="logout-modal__content">
            <h2 id="logout-title">Выйти из аккаунта?</h2>
            <p>После выхода оформление заказа и избранное будут доступны только после повторного входа.</p>
            <div className="logout-modal__actions">
              <button type="button" onClick={() => setIsLogoutConfirmOpen(false)}>
                Остаться
              </button>
              <button type="button" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
