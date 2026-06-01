import { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import styles from './CatalogPage.module.css';
import TeaCard from '../../components/TeaCard';
import { useCart } from '../../contexts/CartContext';
import '../../components/componetns_style/TeaCard.css';

const CatalogPage = () => {
  const { addItem } = useCart();
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedTeaId, setAddedTeaId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchTeas = async () => {
    try {
      const res = await api.get('/teas');
      setTeas(res.data.data || res.data);
    } catch (err) {
      setError('Не удалось загрузить каталог');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeas();
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map();

    teas.forEach((tea) => {
      if (tea.category?.slug && tea.category?.name) {
        categoryMap.set(tea.category.slug, tea.category.name);
      }
    });

    return Array.from(categoryMap, ([slug, name]) => ({ slug, name }));
  }, [teas]);

  const prices = useMemo(
    () => teas.map((tea) => Number(tea.price)).filter((price) => !Number.isNaN(price)),
    [teas]
  );

  const highestPrice = prices.length ? Math.max(...prices) : 0;

  useEffect(() => {
    if (highestPrice && !maxPrice) {
      setMaxPrice(String(highestPrice));
    }
  }, [highestPrice, maxPrice]);

  const filteredTeas = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const selectedMaxPrice = Number(maxPrice);

    return teas.filter((tea) => {
      const teaPrice = Number(tea.price);
      const matchesName = tea.name.toLowerCase().includes(normalizedQuery);
      const matchesCategory = selectedCategory === 'all' || tea.category?.slug === selectedCategory;
      const matchesPrice = Number.isNaN(selectedMaxPrice)
        || Number.isNaN(teaPrice)
        || teaPrice <= selectedMaxPrice;

      return matchesName && matchesCategory && matchesPrice;
    });
  }, [teas, searchQuery, selectedCategory, maxPrice]);

  const handleAddToCart = (tea) => {
    addItem(tea);
    setAddedTeaId(tea.id);
    window.setTimeout(() => setAddedTeaId(null), 1400);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxPrice(highestPrice ? String(highestPrice) : '');
  };

  if (loading) return <div className={styles.status}>Загрузка...</div>;
  if (error) return <div className={`${styles.status} ${styles.error}`}>{error}</div>;

  return (
    <div className={styles.catalogPage}>
      <section className={styles.filters}>
        <div className={styles.filtersHeader}>
          <div>
            <span className={styles.kicker}>Каталог</span>
            <h1>Китайский чай</h1>
          </div>
          <span className={styles.count}>{filteredTeas.length} из {teas.length}</span>
        </div>

        <div className={styles.controls}>
          <label className={styles.field}>
            <span>Название</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Например, пуэр"
            />
          </label>

          <label className={styles.field}>
            <span>Сорт</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="all">Все сорта</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className={`${styles.field} ${styles.priceField}`}>
            <span>Цена до {Number(maxPrice || 0).toLocaleString('ru-RU')} ₸</span>
            <input
              type="range"
              min="0"
              max={highestPrice}
              step="100"
              value={maxPrice || highestPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              disabled={!highestPrice}
            />
          </label>

          <button className={styles.resetButton} type="button" onClick={resetFilters}>
            Сбросить
          </button>
        </div>
      </section>

      {addedTeaId && (
        <div className={styles.cartNotice} role="status">
          Товар добавлен в корзину
        </div>
      )}

      {filteredTeas.length > 0 ? (
        <div className={styles.catalogGrid}>
          {filteredTeas.map((tea) => (
            <TeaCard key={tea.id} tea={tea} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить название, сорт или верхнюю границу цены.</p>
          <button type="button" onClick={resetFilters}>Показать все чаи</button>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
