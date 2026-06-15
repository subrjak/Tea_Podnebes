import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContexts';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getTeaWeightOptions, getWeightLabel, getWeightPrice, isPressedTea } from '../../utils/teaWeights';
import styles from './DetailPage.module.css';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;

const TeaDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [tea, setTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(100);
  const [notice, setNotice] = useState(null);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    const fetchTea = async () => {
      try {
        const res = await api.get(`/teas/${slug}`);
        setTea(res.data);
      } catch (err) {
        setError('Товар не найден');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTea();
  }, [slug]);

  const weightOptions = useMemo(() => (
    tea ? getTeaWeightOptions(tea) : [25, 50, 100, 200]
  ), [tea]);

  const selectedPrice = tea ? getWeightPrice(tea.price, selectedWeight) : 0;

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!tea) return <div className={styles.notFound}>Чай не найден</div>;

  const handleAddToCart = () => {
    const result = addItem(tea, selectedWeight);
    setNotice(result.ok ? 'Товар добавлен в корзину' : result.message);
    window.setTimeout(() => setNotice(null), 1800);
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated || favoriteBusy) return;

    setFavoriteBusy(true);

    try {
      await toggleFavorite(tea);
    } finally {
      setFavoriteBusy(false);
    }
  };

  const formatTemperature = (value) => {
    if (!value) return 'Не указано';

    const temperature = String(value);
    return temperature.includes('°') || temperature.toLowerCase().includes('c')
      ? temperature
      : `${temperature}°C`;
  };

  const specs = [
    { label: 'Происхождение', value: tea.origin || 'Не указано' },
    { label: 'Выдержка', value: tea.age ? `${tea.age} лет` : 'Не указано' },
    { label: 'Температура воды', value: formatTemperature(tea.brewing_temperature) },
    { label: 'Посуда', value: tea.recommended_ware || 'Не указано' },
  ];
  const inStock = Number(tea.stock) > 0;

  return (
    <div className={styles.teaDetail}>
      <Link className={styles.backLink} to="/catalog">
        Назад в каталог
      </Link>

      <section className={styles.hero}>
        <div className={styles.mediaPanel}>
          <img
            src={tea.image || '/placeholder.jpg'}
            alt={tea.name}
            className={styles.image}
          />
        </div>

        <div className={styles.summaryPanel}>
          <div className={styles.category}>{tea.category?.name || 'Чайная коллекция'}</div>
          <h1 className={styles.title}>{tea.name}</h1>
          <p className={styles.subtitle}>
            {tea.origin ? `${tea.origin}. ` : ''}
            Подобранный листовой чай для спокойного ритуала и выразительного вкуса.
          </p>

          <div className={styles.buyPanel}>
            <span className={styles.priceLabel}>Выберите фасовку</span>
            <div className={styles.weightOptions}>
              {weightOptions.map((weight) => (
                <button
                  className={selectedWeight === weight ? styles.activeWeight : ''}
                  key={weight}
                  type="button"
                  onClick={() => setSelectedWeight(weight)}
                >
                  {getWeightLabel(weight)}
                </button>
              ))}
            </div>
            {isPressedTea(tea) && (
              <p className={styles.weightHint}>357 г доступно для прессованного блина.</p>
            )}
            <span className={styles.priceLabel}>Цена за выбранную фасовку</span>
            <strong className={styles.price}>{formatPrice(selectedPrice)}</strong>
            <span className={inStock ? styles.stock : styles.stockEmpty}>
              {inStock ? `На складе: ${tea.stock} шт.` : 'Нет в наличии'}
            </span>
            <div className={styles.actions}>
              <button className={styles.addButton} disabled={!inStock} onClick={handleAddToCart}>
                Добавить в корзину
              </button>
              <button
                className={`${styles.favoriteButton} ${isFavorite(tea.id) ? styles.favoriteActive : ''}`}
                type="button"
                disabled={!isAuthenticated || favoriteBusy}
                title={isAuthenticated ? 'Избранное' : 'Войдите, чтобы добавить в избранное'}
                onClick={handleFavoriteClick}
              >
                {isFavorite(tea.id) ? 'В избранном' : 'В избранное'}
              </button>
              <Link className={styles.secondaryButton} to="/catalog">
                Смотреть еще
              </Link>
            </div>
            {notice && <div className={styles.notice} role="status">{notice}</div>}
          </div>

          <div className={styles.quickSpecs}>
            <div>
              <span>Температура</span>
              <strong>{formatTemperature(tea.brewing_temperature)}</strong>
            </div>
            <div>
              <span>Выдержка</span>
              <strong>{tea.age ? `${tea.age} лет` : 'Не указано'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.description}>
          <span className={styles.sectionKicker}>Описание</span>
          <h2>О чае</h2>
          <p>{tea.description || 'Описание скоро появится.'}</p>
        </div>

        <div className={styles.specs}>
          <span className={styles.sectionKicker}>Характеристики</span>
          <div className={styles.specGrid}>
            {specs.map((spec) => (
              <div className={styles.specItem} key={spec.label}>
                <span className={styles.specLabel}>{spec.label}</span>
                <strong className={styles.specValue}>{spec.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeaDetailPage;
