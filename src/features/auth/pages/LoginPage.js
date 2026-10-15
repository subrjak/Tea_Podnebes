import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/AuthContexts';
import styles from './AuthPage.module.css';

const getReturnPath = () => {
  const requestedPath = new URLSearchParams(window.location.search).get('next');
  if (!requestedPath || !requestedPath.startsWith('/')) return '/profile';

  try {
    const requestedUrl = new URL(requestedPath, window.location.origin);
    if (requestedUrl.origin !== window.location.origin) return '/profile';
    return `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`;
  } catch {
    return '/profile';
  }
};

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
    setSubmitting(true);

    try {
      await login(form);
      router.replace(getReturnPath());
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось войти. Проверьте email и пароль.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <section className={styles.authCard}>
        <span className={styles.kicker}>Профиль</span>
        <h1>Вход</h1>
        <p>Войдите, чтобы открыть личный профиль и продолжить покупки.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

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
              autoComplete="current-password"
              required
            />
          </label>

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className={styles.switchText}>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
