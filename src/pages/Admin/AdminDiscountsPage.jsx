import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import styles from './AdminDashboardPage.module.css';

const emptyForm = {
  title: '',
  discount_percent: 25,
  starts_at: '',
  ends_at: '',
  is_active: true,
};

const AdminDiscountsPage = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/discount-events')
      .then((res) => setEvents(res.data.events || []))
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить событийные скидки.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post('/admin/discount-events', {
        ...form,
        discount_percent: Number(form.discount_percent),
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      });
      setEvents((currentEvents) => [res.data.event, ...currentEvents]);
      setForm(emptyForm);
      setMessage(res.data.message || 'Скидка создана.');
    } catch (err) {
      const validation = err.response?.data?.errors;
      const firstValidationMessage = validation ? Object.values(validation).flat()[0] : null;
      setError(firstValidationMessage || err.response?.data?.message || 'Не удалось создать скидку.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.status}>Загружаем скидки...</div>;

  return (
    <div className={styles.adminPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Событийные скидки</span>
          <h1>Акции и особые периоды</h1>
          <p>Скидки выше статуса покупателя доступны только здесь.</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/admin">Админ-панель</Link>
          <Link to="/catalog">Каталог</Link>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Новая скидка</span>
            <h2>Период события</h2>
          </div>
          <form className={styles.teaForm} onSubmit={handleSubmit}>
            <label className={styles.fullField}>
              <span>Название</span>
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              <span>Скидка, %</span>
              <input
                name="discount_percent"
                type="number"
                min="1"
                max="80"
                value={form.discount_percent}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Активна</span>
              <select name="is_active" value={form.is_active ? '1' : '0'} onChange={(event) => setForm((currentForm) => ({ ...currentForm, is_active: event.target.value === '1' }))}>
                <option value="1">Да</option>
                <option value="0">Нет</option>
              </select>
            </label>
            <label>
              <span>Начало</span>
              <input name="starts_at" type="datetime-local" value={form.starts_at} onChange={handleChange} />
            </label>
            <label>
              <span>Окончание</span>
              <input name="ends_at" type="datetime-local" value={form.ends_at} onChange={handleChange} />
            </label>
            <div className={styles.formActions}>
              <button type="submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Создать скидку'}</button>
            </div>
            {message && <p className={styles.formMessage}>{message}</p>}
            {error && <p className={`${styles.formMessage} ${styles.formMessageError}`}>{error}</p>}
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Список</span>
            <h2>Созданные события</h2>
          </div>
          <div className={styles.tableList}>
            {events.map((event) => (
              <div className={styles.tableRow} key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.is_active ? 'Активна' : 'Отключена'} / {event.starts_at || 'без начала'} - {event.ends_at || 'без окончания'}</span>
                </div>
                <em>{event.discount_percent}%</em>
              </div>
            ))}
            {!events.length && <p className={styles.emptyText}>Событийных скидок пока нет.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDiscountsPage;
