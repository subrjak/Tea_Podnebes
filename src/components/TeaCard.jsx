import { Link } from 'react-router-dom';

const TeaCard = ({ tea, onAddToCart }) => {
  return (
    <div className="tea-card">
      <Link to={`/tea/${tea.slug}`}>
        <img src={tea.image || '/placeholder.jpg'} alt={tea.name} />
        <h3>{tea.name}</h3>
        <p>{tea.category?.name || 'Без категории'}</p>
        <p>Цена: {tea.price} ₸</p>
      </Link>
      <button onClick={() => onAddToCart(tea)}>В корзину</button>
    </div>
  );
};

export default TeaCard;