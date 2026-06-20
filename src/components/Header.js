import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { useCart } from '../contexts/CartContext';
import './componetns_style/Header.css';

function Header({ theme, onToggleTheme }) {
  const navigate = useNavigate();
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
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <NavLink className="logo" to="/">Лист Поднебесной</NavLink>

        <nav className="nav">
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink className="cart-link" to="/cart">
            Корзина
            {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
          </NavLink>
          {canOpenAdmin && <NavLink to="/admin">Админ</NavLink>}
          {!canOpenAdmin && canManageTeas && <NavLink to="/admin/teas">Склад</NavLink>}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3V5.5M12 18.5V21M5.64 5.64L7.4 7.4M16.6 16.6L18.36 18.36M3 12H5.5M18.5 12H21M5.64 18.36L7.4 16.6M16.6 7.4L18.36 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20.25 15.35A8.25 8.25 0 0 1 8.65 3.75 8.75 8.75 0 1 0 20.25 15.35Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </button>

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
                  <NavLink to="/profile" role="menuitem" onClick={closeMenu}>
                    Личный кабинет
                  </NavLink>
                  {canOpenAdmin && (
                    <NavLink to="/admin" role="menuitem" onClick={closeMenu}>
                      Админ-панель
                    </NavLink>
                  )}
                  {!canOpenAdmin && canManageTeas && (
                    <NavLink to="/admin/teas" role="menuitem" onClick={closeMenu}>
                      Управление складом
                    </NavLink>
                  )}
                  <button type="button" role="menuitem" onClick={() => setIsLogoutConfirmOpen(true)}>
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" role="menuitem" onClick={closeMenu}>
                    Войти в аккаунт
                  </NavLink>
                  <NavLink to="/register" role="menuitem" onClick={closeMenu}>
                    Зарегистрироваться
                  </NavLink>
                </>
              )}
            </div>
          )}
          </div>
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
