import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContexts';
import { useFavorites } from '../contexts/FavoritesContext';
import styles from './ProfilePage.module.css';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : 'Сегодня');

const ORDER_STATUS = {
  pending: { label: 'Ожидает подтверждения', tone: 'pending' },
  confirmed: { label: 'Заказ принят', tone: 'confirmed' },
  rejected: { label: 'Заказ отклонен', tone: 'rejected' },
  paid: { label: 'Заказ оплачен', tone: 'paid' },
};

const PAYMENT_STATUS = {
  pending: 'Ожидает оплаты',
  paid: 'Оплата получена',
  canceled: 'Оплата отменена',
  cash_on_delivery: 'Оплата при получении',
};

const canManageTeas = (user) => {
  const status = (user?.admin_status || '').toLowerCase();
  return status.includes('админ') || status.includes('заведующий складом');
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { favorites, toggleFavorite, reloadFavorites } = useFavorites();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    profile_phone: user?.profile_phone || '',
    profile_telegram: user?.profile_telegram || '',
    profile_address: user?.profile_address || '',
  });

  useEffect(() => {
    setForm({
      name: user?.name || '',
      profile_phone: user?.profile_phone || '',
      profile_telegram: user?.profile_telegram || '',
      profile_address: user?.profile_address || '',
    });
  }, [user]);

  useEffect(() => {
    let active = true;

    const loadOrders = async (showLoading = false) => {
      if (showLoading) {
        setOrdersLoading(true);
      }

      try {
        const res = await api.get('/orders');
        if (active) {
          setOrders(res.data.orders || []);
        }
      } finally {
        if (active) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders(true);
    reloadFavorites();

    const intervalId = window.setInterval(() => loadOrders(false), 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [reloadFavorites]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile(form);
      setMessage('Профиль сохранен.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Не удалось сохранить профиль.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLogoutConfirmOpen(false);
    navigate('/login');
  };

  const nextStatusProgress = user?.next_status_quantity
    ? Math.min(100, Math.round((Number(user.purchased_quantity || 0) / Number(user.next_status_quantity)) * 100))
    : 100;

  return (
    <div className={styles.profilePage}>
      <section className={styles.profileCard}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Личный кабинет</span>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
          <div className={styles.avatar}>
            {user?.name?.slice(0, 1).toUpperCase()}
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={user?.is_admin ? styles.adminStatus : undefined}>
            <span>Статус</span>
            <strong>{user?.is_admin ? (user?.admin_status || 'Действующий админ') : user?.customer_status}</strong>
          </div>
          <div>
            <span>Скидка</span>
            <strong>{Number(user?.discount_percent || 0)}%</strong>
          </div>
          <div>
            <span>Куплено товаров</span>
            <strong>{Number(user?.purchased_quantity || 0)} шт.</strong>
          </div>
        </div>

        <div className={styles.statusPanel}>
          <div>
            <span>Прогресс статуса</span>
            <strong>
              {user?.next_status_title
                ? `До «${user.next_status_title}»: ${Math.max(0, user.next_status_quantity - user.purchased_quantity)} шт.`
                : 'Максимальный статус достигнут'}
            </strong>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${nextStatusProgress}%` }} />
          </div>
        </div>

        <div className={styles.actions}>
          {user?.is_admin && <Link to="/admin">Открыть админ-панель</Link>}
          {!user?.is_admin && canManageTeas(user) && <Link to="/admin/teas">Открыть склад</Link>}
          <Link to="/catalog">Перейти в каталог</Link>
          <Link to="/cart">Открыть корзину</Link>
          <button type="button" onClick={() => setIsLogoutConfirmOpen(true)}>Выйти</button>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.kicker}>Настройки</span>
          <h2>Данные профиля</h2>
        </div>
        <form className={styles.profileForm} onSubmit={handleSave}>
          <label>
            <span>Имя</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            <span>Телефон</span>
            <input name="profile_phone" value={form.profile_phone} onChange={handleChange} />
          </label>
          <label>
            <span>Telegram</span>
            <input name="profile_telegram" value={form.profile_telegram} onChange={handleChange} placeholder="@username" />
          </label>
          <label className={styles.fullField}>
            <span>Адрес доставки</span>
            <textarea name="profile_address" value={form.profile_address} onChange={handleChange} rows="3" />
          </label>
          <button type="submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить'}</button>
          {message && <p className={styles.formMessage}>{message}</p>}
        </form>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.kicker}>Избранное</span>
          <h2>Любимые товары</h2>
        </div>
        {favorites.length ? (
          <div className={styles.favoriteGrid}>
            {favorites.map((tea) => (
              <article className={styles.favoriteItem} key={tea.id}>
                <img src={tea.image || '/placeholder.jpg'} alt={tea.name} />
                <div>
                  <Link to={`/tea/${tea.slug}`}>{tea.name}</Link>
                  <span>{formatPrice(tea.price)} / 100 г</span>
                </div>
                <button type="button" onClick={() => toggleFavorite(tea)}>Убрать</button>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>Пока нет избранных товаров. Добавьте чай из каталога сердцем на карточке.</p>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.kicker}>История</span>
          <h2>Покупки</h2>
        </div>
        {ordersLoading ? (
          <p className={styles.emptyText}>Загружаем историю...</p>
        ) : orders.length ? (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <article className={styles.orderItem} key={order.id}>
                <div className={styles.orderTopline}>
                  <div>
                    <strong>Заказ #{order.order_number}</strong>
                    <span>{formatDate(order.created_at)} / {order.total_quantity} шт.</span>
                  </div>
                  <div className={styles.orderSummary}>
                    <span className={`${styles.orderBadge} ${styles[`orderBadge_${ORDER_STATUS[order.status]?.tone || 'pending'}`]}`}>
                      {ORDER_STATUS[order.status]?.label || 'Статус уточняется'}
                    </span>
                    <em>{formatPrice(order.total_price)}</em>
                  </div>
                </div>
                <p className={styles.orderPayment}>
                  {PAYMENT_STATUS[order.payment_status] || 'Статус оплаты уточняется'}
                </p>
                {Number(order.discount_percent) > 0 && (
                  <p className={styles.orderDiscount}>
                    Скидка {order.discount_percent}%: {formatPrice(order.subtotal_price)} -> {formatPrice(order.total_price)}
                  </p>
                )}
                <div className={styles.orderProducts}>
                  {order.items?.map((item) => (
                    <span key={item.id}>{item.tea_name}, {item.weight} г x{item.quantity}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>Покупок пока нет. После оформления заказ появится здесь.</p>
        )}
      </section>

      {isLogoutConfirmOpen && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="profile-logout-title">
          <div className={styles.modalContent}>
            <h2 id="profile-logout-title">Выйти из аккаунта?</h2>
            <p>Вы сможете снова войти по email и паролю.</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsLogoutConfirmOpen(false)}>Отмена</button>
              <button type="button" onClick={handleLogout}>Выйти</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
