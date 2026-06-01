import { Link } from 'react-router-dom';

const TeaCard = ({ tea, onAddToCart }) => {
  return (
    <div className="tea-card">
      <Link to={`/tea/${tea.slug}`}>
        <img src={tea.image || '/placeholder.jpg'} alt={tea.name} />
      </Link>
      <div className="card-body">
        <Link to={`/tea/${tea.slug}`}>
          <h3>{tea.name}</h3>
        </Link>
        <p>{tea.category?.name || 'Без категории'}</p>
        <p className="price">{tea.price} ₸ за 100 грамм</p>
        <button onClick={() => onAddToCart(tea)}>В корзину</button>
      </div>
    </div>
  );
};

export default TeaCard;