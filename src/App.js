import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Home/HomePages";
import TeaDetailPage from './pages/TeaDetailPage';
import CatalogPage from "./pages/Catalog/CatalogPage";
import CartPage from "./pages/Cart/CartPage";
import "./styles/index.css";
import bgImage from "./assets/background.jpg";

function App() {
  return (
    <div
      className="app-wrapper"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
      }}
    >
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/tea/:slug" element={<TeaDetailPage />} />
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;