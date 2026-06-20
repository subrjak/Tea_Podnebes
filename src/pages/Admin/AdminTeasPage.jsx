import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContexts';
import styles from './AdminDashboardPage.module.css';

const emptyForm = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  origin: 'Китай, Юньнань',
  age: 1,
  price: '',
  stock: 1,
  image: '',
  brewing_temperature: '',
  recommended_ware: '',
};

const canManageTeas = (user) => {
  const status = (user?.admin_status || '').toLowerCase();
  return status.includes('админ') || status.includes('заведующий складом');
};

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;

const AdminTeasPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const allowed = useMemo(() => canManageTeas(user), [user]);

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }

    api.get('/admin/teas')
      .then((res) => {
        const nextCategories = res.data.categories || [];
        setCategories(nextCategories);
        setTeas(res.data.teas || []);
        setForm((currentForm) => ({
          ...currentForm,
          category_id: currentForm.category_id || nextCategories[0]?.id || '',
        }));
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Не удалось загрузить товары.');
      })
      .finally(() => setLoading(false));
  }, [allowed]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        age: Number(form.age),
        price: Number(form.price),
        stock: Number(form.stock),
      };
      const res = await api.post('/admin/teas', payload);
      setTeas((currentTeas) => [res.data.tea, ...currentTeas].slice(0, 30));
      setMessage(res.data.message || 'Товар добавлен.');
      setForm({
        ...emptyForm,
        category_id: form.category_id,
        origin: form.origin,
      });
    } catch (err) {
      const validation = err.response?.data?.errors;
      const firstValidationMessage = validation ? Object.values(validation).flat()[0] : null;
      setError(firstValidationMessage || err.response?.data?.message || 'Не удалось добавить товар.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.status}>Загружаем управление товарами...</div>;
  }

  if (!allowed) {
    return (
      <div className={`${styles.status} ${styles.error}`}>
        Добавлять товары могут только Админ и Заведующий складом.
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Склад</span>
          <h1>Добавление товаров</h1>
          <p>{user?.admin_status || 'Сотрудник'}</p>
        </div>
        <div className={styles.heroActions}>
          {user?.is_admin && <Link to="/admin">Админ-панель</Link>}
          <Link to="/catalog">Каталог</Link>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Новый товар</span>
            <h2>Карточка чая</h2>
          </div>
          <form className={styles.teaForm} onSubmit={handleSubmit}>
            <label>
              <span>Название</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              <span>Slug</span>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="Можно оставить пустым" />
            </label>
            <label>
              <span>Категория</span>
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Цена за 100 г</span>
              <input name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              <span>Остаток, шт.</span>
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
            </label>
            <label>
              <span>Выдержка, лет</span>
              <input name="age" type="number" min="0" max="255" step="1" value={form.age} onChange={handleChange} required />
            </label>
            <label>
              <span>Происхождение</span>
              <input name="origin" value={form.origin} onChange={handleChange} required />
            </label>
            <label>
              <span>Температура</span>
              <input name="brewing_temperature" value={form.brewing_temperature} onChange={handleChange} placeholder="95-100°C" />
            </label>
            <label className={styles.fullField}>
              <span>Путь к изображению</span>
              <input name="image" value={form.image} onChange={handleChange} placeholder="/img/teas/example.jpg или https://..." />
            </label>
            <label className={styles.fullField}>
              <span>Рекомендуемая посуда</span>
              <input name="recommended_ware" value={form.recommended_ware} onChange={handleChange} />
            </label>
            <label className={styles.fullField}>
              <span>Описание</span>
              <textarea name="description" rows="9" value={form.description} onChange={handleChange} />
            </label>
            <div className={styles.formActions}>
              <button type="submit" disabled={saving}>
                {saving ? 'Добавляем...' : 'Добавить товар'}
              </button>
            </div>
            {message && <p className={styles.formMessage}>{message}</p>}
            {error && <p className={`${styles.formMessage} ${styles.formMessageError}`}>{error}</p>}
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Каталог</span>
            <h2>Последние товары</h2>
          </div>
          {teas.length ? (
            <div className={styles.tableList}>
              {teas.map((tea) => (
                <div className={styles.tableRow} key={tea.id}>
                  <div>
                    <strong>{tea.name}</strong>
                    <span>{tea.category?.name || 'Без категории'} / {tea.origin}</span>
                  </div>
                  <em>{formatPrice(tea.price)} / {tea.stock} шт.</em>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Товары пока не загружены.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminTeasPage;
