import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/Home/HomePages';
import TeaDetailPage from './pages/Catalog/TeaDetailPage';
import CatalogPage from './pages/Catalog/CatalogPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import CeremonyPage from './pages/Ceremony/CeremonyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FaqPage from './pages/FaqPage';
import ContactsPage from './pages/ContactsPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import './styles/index.css';
import bgImage from './assets/background.jpg';

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
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route path="/tea-ceremony" element={<CeremonyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/tea/:slug" element={<TeaDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<div className="auth-status">Страница не найдена</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
