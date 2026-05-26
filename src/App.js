import Header from "./components/Header"
import Footer from "./components/Footer"
import HomePage from "./pages/Home/HomePages"
import "./styles/index.css"
import api from './api/api.js'

function App() {
  return (
    <div className = "wrapper">
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}


export default App;
