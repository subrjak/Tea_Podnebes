import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { useFavorites } from '../contexts/FavoritesContext';
import { getTeaWeightOptions, getWeightLabel, getWeightPrice } from '../utils/teaWeights';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;

const TeaCard = ({ tea, onAddToCart }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const weightOptions = useMemo(() => getTeaWeightOptions(tea), [tea]);
  const [selectedWeight, setSelectedWeight] = useState(() => (
    weightOptions.includes(100) ? 100 : weightOptions[0]
  ));
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const selectedPrice = getWeightPrice(tea.price, selectedWeight);
  const inStock = Number(tea.stock) > 0;

  useEffect(() => {
    if (!weightOptions.includes(selectedWeight)) {
      setSelectedWeight(weightOptions.includes(100) ? 100 : weightOptions[0]);
    }
  }, [selectedWeight, weightOptions]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated || favoriteBusy) return;

    setFavoriteBusy(true);

    try {
      await toggleFavorite(tea);
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <div className="tea-card">
      <Link className="tea-card__image-link" to={`/tea/${tea.slug}`} aria-label={`Открыть ${tea.name}`}>
        <img src={tea.image || '/placeholder.jpg'} alt={tea.name} />
      </Link>

      <div className="card-body">
        <div className="tea-card__topline">
          <span className="tea-card__category">{tea.category?.name || 'Без категории'}</span>
          <button
            className={`tea-card__favorite ${isFavorite(tea.id) ? 'is-active' : ''}`}
            type="button"
            aria-label={isFavorite(tea.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
            title={isAuthenticated ? 'Избранное' : 'Войдите, чтобы добавить в избранное'}
            disabled={!isAuthenticated || favoriteBusy}
            onClick={handleFavoriteClick}
          >
            ♥
          </button>
        </div>

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

        <span className={inStock ? 'tea-card__stock' : 'tea-card__stock is-empty'}>
          {inStock ? `На складе: ${tea.stock} шт.` : 'Нет в наличии'}
        </span>

        <div className="tea-card__actions">
          <button
            className="add-to-cart"
            disabled={!inStock}
            onClick={() => onAddToCart(tea, selectedWeight)}
          >
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
