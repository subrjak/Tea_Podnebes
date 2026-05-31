import React from 'react';
import "./HomePage.css";

const HomePage = () => {
    return (
        <div className="home-page">
            {/* Hero секция */}
            <section className="hero">
                    <div className="hero-content">
                        <h1 className="hero-title">Китайский чай с лучших плантаций</h1>
                        <p className="hero-subtitle">
                            Пуэр, улуны и другие чаи напрямую от китайских поставщиков
                        </p>
                        <div className="hero-buttons">
                            <a href="#" className="btn btn-primary">Посмотреть каталог</a>
                            <a href="#" className="btn btn-link">О чайной церемонии →</a>
                        </div>
                    </div>
            </section>

            {/* Секция "Виды чая" */}
            <section className="tea-types">
                    <h2 className="section-title">Виды чая</h2>
                    <div className="tea-grid">
                        <div className="tea-card">
                            <img src="/img/red_tea.jpg" alt="Красный чай" className="tea-image" />
                            <h3>Красный чай</h3>
                            <p>Самый расслабляющий</p>
                        </div>
                        <div className="tea-card">
                            <img src="/img/white_tea.jpg" alt="Белый чай" className="tea-image" />
                            <h3>Белый чай</h3>
                            <p>Лучший вариант для настройки на работу</p>
                        </div>
                        <div className="tea-card">
                            <img src="/img/oolong.jpg" alt="Улун" className="tea-image" />
                            <h3>Улуны</h3>
                            <p>Для работы и отдыха</p>
                        </div>
                        <div className="tea-card">
                            <img src="/img/puer.jpg" alt="Пуэр" className="tea-image" />
                            <h3>Пуэры</h3>
                            <p>Для неторопливых ценителей</p>
                        </div>
                        <div className="tea-card">
                            <img src="/img/green_tea.jpg" alt="Зеленый чай" className="tea-image" />
                            <h3>Зеленый чай</h3>
                            <p>Тонизирующие и расслабляющие</p>
                        </div>
                    </div>
            </section>

            {/* Секция "О нас" */}
            <section className="about">
                    <h2 className="section-title">О нас</h2>
                    <div className="features-grid">
                        <div className="feature">
                            <div className="feature-icon"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" stroke="url(#paint0_linear_52_80)" strokeWidth="4" />
                                <path d="M61.5833 34.9188C37.6583 40.7697 32.0758 58.8197 26.5465 73.9442L31.5707 75.875L34.0962 69.1465C35.3722 69.6438 36.7013 70.0241 37.6583 70.0241C66.9 70.0241 74.875 20.2917 74.875 20.2917C72.2167 26.1425 53.6083 26.8739 40.3167 29.7993C27.025 32.7248 21.7083 45.1579 21.7083 51.0088C21.7083 56.8596 26.3604 61.9792 26.3604 61.9792C35 34.9188 61.5833 34.9188 61.5833 34.9188Z" fill="#E3D0BE" />
                                <defs>
                                    <linearGradient id="paint0_linear_52_80" x1="100" y1="50" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#AE8842" />
                                        <stop offset="0.5" stopColor="#8B8A7B" />
                                        <stop offset="1" stopColor="#AE8842" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            </div>
                            <h3>Натуральный чай без добавок</h3>
                            <p>Отборные листья с чайных кустов и деревьев</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" stroke="url(#paint0_linear_52_81)" strokeWidth="4" />
                                <path d="M75.8333 50C69.6333 50 64.6397 46.5564 62.9167 44.8333H37.0833C35.3602 46.5564 30.3667 50 24.1667 50L24.6058 50.8835C25.2499 52.1713 26.2401 53.2542 27.4653 54.0108C28.6904 54.7673 30.1021 55.1676 31.5421 55.1667H68.4631C69.9021 55.1666 71.3127 54.7659 72.5369 54.0094C73.7611 53.2529 74.7504 52.1705 75.3942 50.8835L75.8333 50ZM68.0833 29.3333C64.3297 29.3333 61.0179 28.0701 58.6077 26.6932C56.0657 25.2387 54.7947 24.5128 54.1437 24.3397C53.4875 24.1667 52.6221 24.1667 50.8887 24.1667H49.1139C47.3779 24.1667 46.5099 24.1667 45.8589 24.3397C45.2053 24.5128 43.9343 25.2387 41.3923 26.6906C38.9821 28.0727 35.6702 29.3333 31.9167 29.3333L32.3558 30.2168C32.9999 31.5046 33.9901 32.5876 35.2153 33.3441C36.4404 34.1006 37.8521 34.5009 39.2921 34.5H60.7131C62.1521 34.4999 63.5627 34.0992 64.7869 33.3427C66.0111 32.5862 67.0004 31.5039 67.6442 30.2168L68.0833 29.3333Z" stroke="#E3D0BE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M62.9167 44.8333V34.5M37.0833 44.8333V34.5M68.0833 75.8333V55.1667M31.9167 75.8333V55.1667M26.75 75.8333H73.25M44.8333 75.8333V68.0833C44.8333 66.713 45.3777 65.3989 46.3466 64.4299C47.3156 63.461 48.6297 62.9167 50 62.9167C51.3703 62.9167 52.6844 63.461 53.6534 64.4299C54.6223 65.3989 55.1667 66.713 55.1667 68.0833V75.8333" stroke="#E3D0BE" strokeWidth="1.5" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="paint0_linear_52_81" x1="100" y1="50" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#AE8842" />
                                        <stop offset="0.5" stopColor="#8B8A7B" />
                                        <stop offset="1" stopColor="#AE8842" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            </div>
                            <h3>Поставки напрямую из Китая</h3>
                            <p>Мы работаем с лучшими чайными мастерами Китая</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" stroke="url(#paint0_linear_52_82)" strokeWidth="4" />
                                <mask id="mask0_52_82" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="23" y="28" width="55" height="49">
                                    <path d="M44.8334 61.625L52.5834 64.2083C52.5834 64.2083 71.9584 60.3333 74.5417 60.3333C77.125 60.3333 77.125 62.9167 74.5417 65.5C71.9584 68.0833 62.9167 75.8333 55.1667 75.8333C47.4167 75.8333 42.25 71.9583 37.0834 71.9583H24.1667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M24.1667 56.4583C26.75 53.875 31.9167 50 37.0834 50C42.25 50 54.5209 55.1667 56.4584 57.75C58.3959 60.3333 52.5834 64.2083 52.5834 64.2083M39.6667 42.25V31.9167C39.6667 31.2315 39.9389 30.5745 40.4233 30.09C40.9078 29.6055 41.5649 29.3333 42.25 29.3333H73.25C73.9352 29.3333 74.5922 29.6055 75.0767 30.09C75.5612 30.5745 75.8334 31.2315 75.8334 31.9167V52.5833" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M51.2917 29.3333H64.2084V40.9583H51.2917V29.3333Z" fill="#555555" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </mask>
                                <g mask="url(#mask0_52_82)">
                                    <path d="M19 19H81V81H19V19Z" fill="#E3D0BE" />
                                </g>
                                <defs>
                                    <linearGradient id="paint0_linear_52_82" x1="100" y1="50" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#AE8842" />
                                        <stop offset="0.5" stopColor="#8B8A7B" />
                                        <stop offset="1" stopColor="#AE8842" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            </div>
                            <h3>Быстрая доставка и возможность самовывоза</h3>
                            <p>Доставка через Яндекс и возможность самовывоза в двух точках города</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" stroke="url(#paint0_linear_363_61)" strokeWidth="4" />
                                <path d="M49.5 24.5C52.9688 24.5 55.75 27.2812 55.75 30.75C55.75 34.2188 52.9688 37 49.5 37C46.0312 37 43.25 34.2188 43.25 30.75C43.25 27.2812 46.0625 24.5 49.5 24.5ZM77.625 62V55.75C70.625 55.75 64.625 52.75 60.125 47.375L55.9375 42.375C55.3561 41.6702 54.6258 41.103 53.7991 40.7139C52.9725 40.3249 52.0699 40.1238 51.1562 40.125H47.9375C46.0312 40.125 44.2812 40.9375 43.0937 42.375L38.9062 47.375C34.375 52.75 28.375 55.75 21.375 55.75V62C30.0312 62 37.5938 58.3437 43.25 51.8438V58.875L31.125 63.7187C29.0312 64.5625 27.625 66.6875 27.625 68.9062C27.625 72 30.125 74.5 33.2187 74.5H40.125V72.9375C40.125 70.8655 40.9481 68.8784 42.4132 67.4132C43.8784 65.9481 45.8655 65.125 47.9375 65.125H57.3125C58.1875 65.125 58.875 65.8125 58.875 66.6875C58.875 67.5625 58.1875 68.25 57.3125 68.25H47.9375C45.3438 68.25 43.25 70.3438 43.25 72.9375V74.5H65.7812C68.875 74.5 71.375 72 71.375 68.9062C71.375 66.6875 69.9687 64.5625 67.875 63.7187L55.75 58.875V51.8438C61.4062 58.3437 68.9688 62 77.625 62Z" fill="#E3D0BE" />
                                <defs>
                                    <linearGradient id="paint0_linear_363_61" x1="100" y1="50" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#AE8842" />
                                        <stop offset="0.5" stopColor="#8B8A7B" />
                                        <stop offset="1" stopColor="#AE8842" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            </div>
                            <h3>Китайский чай — это не просто напиток, это философия и традиции</h3>
                            <p>Прикоснитесь к древней культуре с каждой чашкой</p>
                        </div>
                    </div>
            </section>
        </div>
    );
};

export default HomePage;