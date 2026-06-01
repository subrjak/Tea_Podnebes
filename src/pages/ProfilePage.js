import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.profilePage}>
      <section className={styles.profileCard}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Личный профиль</span>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
          <div className={styles.avatar}>
            {user?.name?.slice(0, 1).toUpperCase()}
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div>
            <span>Статус</span>
            <strong>Активный покупатель</strong>
          </div>
          <div>
            <span>Почта</span>
            <strong>{user?.email}</strong>
          </div>
          <div>
            <span>Профиль создан</span>
            <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Сегодня'}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/catalog">Перейти в каталог</Link>
          <Link to="/cart">Открыть корзину</Link>
          <button type="button" onClick={handleLogout}>Выйти</button>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
