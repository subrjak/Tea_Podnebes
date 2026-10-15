import { useEffect, useState } from 'react';
import api from '@/shared/api/api';
import styles from './CatalogPage.module.css';
import TeaCard from '@/shared/ui/TeaCard';
import { useCart } from '@/features/cart/model/CartContext';

const PER_PAGE = 12;

const useDebouncedValue = (value, delay = 350) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};

const CatalogPage = () => {
  const { addItem } = useCart();
  const [teas, setTeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    max_price: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const debouncedMaxPrice = useDebouncedValue(maxPrice);

  useEffect(() => {
    let active = true;

    const fetchTeas = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setFetching(true);
      }

      setError(null);

      const params = {
        page,
        per_page: PER_PAGE,
      };

      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (debouncedMaxPrice) {
        params.max_price = debouncedMaxPrice;
      }

      try {
        const res = await api.get('/teas', { params });
        const nextTeas = res.data.data || [];
        const nextMeta = res.data.meta || {};

        if (!active) return;

        setTeas((currentTeas) => (page === 1 ? nextTeas : [...currentTeas, ...nextTeas]));
        setCategories(nextMeta.categories || []);
        setMeta((currentMeta) => ({
          ...currentMeta,
          ...nextMeta,
        }));

      } catch {
        if (!active) return;
        setError('Не удалось загрузить каталог');
      } finally {
        if (active) {
          setLoading(false);
          setFetching(false);
        }
      }
    };

    fetchTeas();

    return () => {
      active = false;
    };
  }, [page, debouncedSearchQuery, selectedCategory, debouncedMaxPrice]);

  const handleAddToCart = (tea, weight) => {
    const result = addItem(tea, weight);
    setNotice({
      type: result.ok ? 'success' : 'error',
      text: result.ok ? 'Товар добавлен в корзину' : result.message,
    });
    window.setTimeout(() => setNotice(null), 1800);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxPrice('');
    setPage(1);
  };

  const hasMorePages = Number(meta.current_page) < Number(meta.last_page);

  if (loading) return <div className={styles.status}>Загрузка...</div>;
  if (error) return <div className={`${styles.status} ${styles.error}`}>{error}</div>;

  return (
    <div className={styles.catalogPage}>
      {notice && (
        <div className={`${styles.cartNotice} ${notice.type === 'error' ? styles.cartNoticeError : ''}`} role="status">
          {notice.text}
        </div>
      )}
      <section className={styles.filters}>
        <div className={styles.filtersHeader}>
          <div>
            <span className={styles.kicker}>Каталог</span>
            <h1>Китайский чай1</h1>
          </div>
          <span className={styles.count}>{teas.length} из {meta.total}</span>
        </div>

        <div className={styles.controls}>
          <label className={styles.field}>
            <span>Название</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Например, пуэр"
            />
          </label>

          <label className={styles.field}>
            <span>Сорт</span>
            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setPage(1);
              }}
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
            <span>Цена до {Number(maxPrice || meta.max_price || 0).toLocaleString('ru-RU')} ₸</span>
            <input
              type="range"
              min="0"
              max={meta.max_price || 0}
              step="100"
              value={maxPrice || meta.max_price || 0}
              onChange={(event) => {
                setMaxPrice(event.target.value);
                setPage(1);
              }}
              disabled={!meta.max_price}
            />
          </label>

          <button className={styles.resetButton} type="button" onClick={resetFilters}>
            Сбросить
          </button>
        </div>
      </section>

      {teas.length > 0 ? (
        <>
          <div className={styles.catalogGrid}>
            {teas.map((tea) => (
              <TeaCard key={tea.id} tea={tea} onAddToCart={handleAddToCart} />
            ))}
          </div>
          {hasMorePages && (
            <button
              className={styles.loadMoreButton}
              type="button"
              disabled={fetching}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              {fetching ? 'Загружаем...' : 'Показать еще'}
            </button>
          )}
        </>
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
