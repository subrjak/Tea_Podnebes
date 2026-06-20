import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContexts';
import styles from './AdminDashboardPage.module.css';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const canManageUsers = user?.permissions?.users;

  useEffect(() => {
    if (!canManageUsers) {
      setLoading(false);
      return;
    }

    api.get('/admin/users')
      .then((res) => {
        setUsers(res.data.users || []);
        setRoles(res.data.roles || {});
      })
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить пользователей.'))
      .finally(() => setLoading(false));
  }, [canManageUsers]);

  const updateRole = async (targetUser, role) => {
    setBusyUserId(targetUser.id);
    setMessage(null);
    setError(null);

    try {
      const res = await api.put(`/admin/users/${targetUser.id}/role`, { role: role || null });
      setUsers((currentUsers) => currentUsers.map((currentUser) => (
        currentUser.id === targetUser.id ? res.data.user : currentUser
      )));
      setMessage(res.data.message || 'Роль обновлена.');
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось обновить роль.');
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading) {
    return <div className={styles.status}>Загружаем пользователей...</div>;
  }

  if (!canManageUsers) {
    return (
      <div className={`${styles.status} ${styles.error}`}>
        Управлять ролями могут только Владелец и Старший администратор.
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Роли</span>
          <h1>Пользователи и доступы</h1>
          <p>{user?.admin_status || 'Администратор'}</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/admin">Админ-панель</Link>
          <Link to="/admin/teas">Склад</Link>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.kicker}>Доступы</span>
          <h2>Назначение ролей</h2>
        </div>
        {message && <p className={styles.formMessage}>{message}</p>}
        {error && <p className={`${styles.formMessage} ${styles.formMessageError}`}>{error}</p>}
        <div className={styles.tableList}>
          {users.map((targetUser) => (
            <div className={styles.tableRow} key={targetUser.id}>
              <div>
                <strong>{targetUser.name}</strong>
                <span>{targetUser.email}</span>
              </div>
              <label className={styles.roleSelect}>
                <span>Роль</span>
                <select
                  value={targetUser.admin_status || ''}
                  disabled={busyUserId === targetUser.id || targetUser.id === user?.id}
                  onChange={(event) => updateRole(targetUser, event.target.value)}
                >
                  <option value="">Покупатель</option>
                  {Object.entries(roles).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminUsersPage;
