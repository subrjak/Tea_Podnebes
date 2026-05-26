import React from "react"

export default function Header() {
    return (
        <header className="header">
            <div className="logo">
                <span className="logo-text">Лист Поднебесной</span>
            </div>
            <nav className="nav">
                <a href="#">Главная</a>
                <a href="#">Каталог</a>
                <a href="#">О нас</a>
                <a href="#">Контакты</a>
            </nav>
            <button className="cart-btn" aria-label="Корзина">
                🛒
            </button>
        </header>
    )
}