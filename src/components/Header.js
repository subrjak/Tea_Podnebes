import React from 'react';
import { NavLink } from 'react-router-dom';
import "./componetns_style/Header.css"

function Header() {
    return (
        <header className="header">
            <div className="container">
                <div className="logo">Лист Поднебесной</div>
                <nav className="nav">
                    <NavLink to="/" end>Главная</NavLink>
                    <NavLink to="/catalog">Каталог</NavLink>
                    <NavLink to="/cart">Корзина</NavLink>
                </nav>
                <button className="profile" aria-label="Профиль"><svg width="50" height="50" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 11.375C13 9.65109 13.6848 7.99779 14.9038 6.77881C16.1228 5.55982 17.7761 4.875 19.5 4.875C21.2239 4.875 22.8772 5.55982 24.0962 6.77881C25.3152 7.99779 26 9.65109 26 11.375C26 13.0989 25.3152 14.7522 24.0962 15.9712C22.8772 17.1902 21.2239 17.875 19.5 17.875C17.7761 17.875 16.1228 17.1902 14.9038 15.9712C13.6848 14.7522 13 13.0989 13 11.375ZM13 21.125C10.8451 21.125 8.77849 21.981 7.25476 23.5048C5.73102 25.0285 4.875 27.0951 4.875 29.25C4.875 30.5429 5.38861 31.7829 6.30285 32.6971C7.21709 33.6114 8.45707 34.125 9.75 34.125H29.25C30.5429 34.125 31.7829 33.6114 32.6971 32.6971C33.6114 31.7829 34.125 30.5429 34.125 29.25C34.125 27.0951 33.269 25.0285 31.7452 23.5048C30.2215 21.981 28.1549 21.125 26 21.125H13Z" fill="#253623" />
                </svg>

                </button>
            </div>
        </header>
    );
}

export default Header;