import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Пароли не совпадают.');
      return;
    }

    setSubmitting(true);

    try {
      await register(form);
      navigate('/profile', { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      setError(firstError || err.response?.data?.message || 'Не удалось создать аккаунт.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <section className={styles.authCard}>
        <span className={styles.kicker}>Новый профиль</span>
        <h1>Регистрация</h1>
        <p>Создайте аккаунт, чтобы быстрее оформлять заказы и хранить данные профиля.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            <span>Имя</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Пароль</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Повторите пароль</span>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Создаем...' : 'Создать профиль'}
          </button>
        </form>

        <div className={styles.switchText}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
