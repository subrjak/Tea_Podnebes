/**
 * @fileoverview Переиспользуемая карточка товара для каталога и подборок.
 * Передайте товар API и обработчик добавления в корзину. Компонент показывает
 * варианты веса/цену, состояние наличия, переход к товару и кнопку избранного.
 * @example <TeaCard tea={tea} onAddToCart={handleAddToCart} />
 * Цена и доступные фасовки вычисляются из данных товара; избранное меняется
 * через FavoritesContext, а добавление выполняется callback родителя.
 */
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/auth/model/AuthContexts';
import { useFavorites } from '@/features/favorites/model/FavoritesContext';
import { getTeaWeightOptions, getWeightLabel, getWeightPrice } from '@/shared/lib/utils/teaWeights';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;

/** @param {{tea: object, onAddToCart: (tea: object, weight: number) => void}} props Данные карточки и callback корзины. */
const TeaCard = ({ tea, onAddToCart }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const weightOptions = useMemo(() => getTeaWeightOptions(tea), [tea]);
  const [requestedWeight, setRequestedWeight] = useState(100);
  const selectedWeight = weightOptions.includes(requestedWeight)
    ? requestedWeight
    : weightOptions.includes(100) ? 100 : weightOptions[0];
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const selectedPrice = getWeightPrice(tea.price, selectedWeight);
  const inStock = Number(tea.stock) > 0;
  const canAddSelectedWeight = inStock && selectedWeight <= Number(tea.stock);

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
      <Link className="tea-card__image-link" href={`/tea/${tea.slug}`} aria-label={`Открыть ${tea.name}`}>
        <Image
          src={tea.image || '/placeholder.jpg'}
          alt={tea.name ? `Чай ${tea.name}` : 'Чай из каталога'}
          width={480}
          height={330}
          unoptimized
        />
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

        <Link className="tea-card__title-link" href={`/tea/${tea.slug}`}>
          <h3>{tea.name}</h3>
        </Link>

        <div className="tea-card__meta">
          <span>{getWeightLabel(selectedWeight, tea)}</span>
          <strong className="price">{formatPrice(selectedPrice)}</strong>
        </div>

        <label className="tea-card__weight">
          <span>Фасовка</span>
          <select
            value={selectedWeight}
            onChange={(event) => setRequestedWeight(Number(event.target.value))}
          >
            {weightOptions.map((weight) => (
              <option key={weight} value={weight}>
                {getWeightLabel(weight, tea)}
              </option>
            ))}
          </select>
        </label>

        <span className={inStock ? 'tea-card__stock' : 'tea-card__stock is-empty'}>
          {inStock ? `На складе: ${tea.stock} г` : 'Нет в наличии'}
        </span>

        <div className="tea-card__actions">
          <button
            className="add-to-cart"
            disabled={!canAddSelectedWeight}
            onClick={() => onAddToCart(tea, selectedWeight)}
          >
            В корзину
          </button>
          <Link className="tea-card__details" href={`/tea/${tea.slug}`}>
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeaCard;
