import { Link } from 'react-router-dom';

const TeaCard = ({ tea, onAddToCart }) => {
  const numericPrice = Number(tea.price);
  const price = Number.isNaN(numericPrice)
    ? tea.price
    : numericPrice.toLocaleString('ru-RU');

  return (
    <div className="tea-card">
      <Link className="tea-card__image-link" to={`/tea/${tea.slug}`} aria-label={`Открыть ${tea.name}`}>
        <img src={tea.image || '/placeholder.jpg'} alt={tea.name} />
      </Link>

      <div className="card-body">
        <span className="tea-card__category">{tea.category?.name || 'Без категории'}</span>

        <Link className="tea-card__title-link" to={`/tea/${tea.slug}`}>
          <h3>{tea.name}</h3>
        </Link>

        <div className="tea-card__meta">
          <span>100 грамм</span>
          <strong className="price">{price} ₸</strong>
        </div>

        <div className="tea-card__actions">
          <button className="add-to-cart" onClick={() => onAddToCart(tea)}>
            В корзину
          </button>
          <Link className="tea-card__details" to={`/tea/${tea.slug}`}>
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeaCard;
