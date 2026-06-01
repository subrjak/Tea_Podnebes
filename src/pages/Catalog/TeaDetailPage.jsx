import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/api';
import { useCart } from '../../contexts/CartContext';
import styles from './DetailPage.module.css';

const TeaDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [tea, setTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdded, setIsAdded] = useState(false);

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

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!tea) return <div className={styles.notFound}>Чай не найден</div>;

  const handleAddToCart = () => {
    addItem(tea);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  };

  const formatPrice = (value) => {
    const numericPrice = Number(value);

    if (Number.isNaN(numericPrice)) {
      return `${value} ₸`;
    }

    return `${numericPrice.toLocaleString('ru-RU')} ₸`;
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
            <span className={styles.priceLabel}>Цена за 100 грамм</span>
            <strong className={styles.price}>{formatPrice(tea.price)}</strong>
            <div className={styles.actions}>
              <button className={styles.addButton} onClick={handleAddToCart}>
                {isAdded ? 'Добавлено' : 'Добавить в корзину'}
              </button>
              <Link className={styles.secondaryButton} to="/catalog">
                Смотреть еще
              </Link>
            </div>
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
