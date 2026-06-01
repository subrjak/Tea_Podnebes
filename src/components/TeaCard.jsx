import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeaWeightOptions, getWeightLabel, getWeightPrice } from '../utils/teaWeights';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;

const TeaCard = ({ tea, onAddToCart }) => {
  const weightOptions = useMemo(() => getTeaWeightOptions(tea), [tea]);
  const [selectedWeight, setSelectedWeight] = useState(100);
  const selectedPrice = getWeightPrice(tea.price, selectedWeight);

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
          <span>{getWeightLabel(selectedWeight)}</span>
          <strong className="price">{formatPrice(selectedPrice)}</strong>
        </div>

        <label className="tea-card__weight">
          <span>Фасовка</span>
          <select
            value={selectedWeight}
            onChange={(event) => setSelectedWeight(Number(event.target.value))}
          >
            {weightOptions.map((weight) => (
              <option key={weight} value={weight}>
                {getWeightLabel(weight)}
              </option>
            ))}
          </select>
        </label>

        <div className="tea-card__actions">
          <button className="add-to-cart" onClick={() => onAddToCart(tea, selectedWeight)}>
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
