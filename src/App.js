import Header from "./components/Header"
import Footer from "./components/Footer"
import HomePage from "./pages/Home/HomePages"
import CatalogPage from "./pages/Catalog/CatalogPage"
import CartPage from "./pages/Cart/CartPage"
import { Routes, Route } from "react-router-dom"
import "./styles/index.css"
import api from './api/api.js'

function App() {
  return (
    <div className="app">
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;