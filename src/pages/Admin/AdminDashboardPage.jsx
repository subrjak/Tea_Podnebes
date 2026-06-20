import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import styles from './AdminDashboardPage.module.css';

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setDashboard(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Не удалось загрузить админ-панель.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.status}>Загружаем админ-панель...</div>;
  }

  if (error) {
    return <div className={`${styles.status} ${styles.error}`}>{error}</div>;
  }

  const stats = [
    { label: 'Пользователи', value: dashboard.stats.users },
    { label: 'Админы', value: dashboard.stats.admins },
    { label: 'Чаи', value: dashboard.stats.teas },
    { label: 'Категории', value: dashboard.stats.categories },
  ];

  return (
    <div className={styles.adminPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Админ-панель</span>
          <h1>Управление магазином</h1>
          <p>{dashboard.admin.admin_status || 'Администратор'}</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/admin/teas">Добавить товар</Link>
          <Link to="/profile">Открыть профиль</Link>
        </div>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((item) => (
          <div className={styles.statCard} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Пользователи</span>
            <h2>Последние регистрации</h2>
          </div>
          <div className={styles.tableList}>
            {dashboard.recent_users.map((user) => (
              <div className={styles.tableRow} key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <em>{user.is_admin ? (user.admin_status || 'Админ') : 'Покупатель'}</em>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Склад</span>
          </div>
          <div className={styles.tableList}>
            {dashboard.low_stock_teas.map((tea) => (
              <div className={styles.tableRow} key={tea.id}>
                <div>
                  <strong>{tea.name}</strong>
                  <span>{tea.category?.name || 'Без категории'}</span>
                </div>
                <em>{tea.stock} шт.</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
