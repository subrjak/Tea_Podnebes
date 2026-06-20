import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import styles from './AdminDashboardPage.module.css';

const emptyForm = {
  id: null,
  blog_category_id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  is_published: true,
};

const AdminBlogPage = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/blog')
      .then((res) => {
        const nextCategories = res.data.categories || [];
        setCategories(nextCategories);
        setPosts(res.data.posts || []);
        setForm((currentForm) => ({
          ...currentForm,
          blog_category_id: currentForm.blog_category_id || nextCategories[0]?.id || '',
        }));
      })
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить блог.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
      blog_category_id: categories[0]?.id || '',
    });
  };

  const editPost = (post) => {
    setForm({
      id: post.id,
      blog_category_id: post.blog_category_id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      is_published: Boolean(post.is_published),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        ...form,
        blog_category_id: Number(form.blog_category_id),
      };
      const res = form.id
        ? await api.put(`/admin/blog/${form.id}`, payload)
        : await api.post('/admin/blog', payload);

      setPosts((currentPosts) => {
        const withoutPost = currentPosts.filter((post) => post.id !== res.data.post.id);
        return [res.data.post, ...withoutPost];
      });
      setMessage(res.data.message || 'Статья сохранена.');
      resetForm();
    } catch (err) {
      const validation = err.response?.data?.errors;
      const firstValidationMessage = validation ? Object.values(validation).flat()[0] : null;
      setError(firstValidationMessage || err.response?.data?.message || 'Не удалось сохранить статью.');
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (post) => {
    if (!window.confirm(`Удалить статью «${post.title}»?`)) return;

    try {
      await api.delete(`/admin/blog/${post.id}`);
      setPosts((currentPosts) => currentPosts.filter((currentPost) => currentPost.id !== post.id));
      setMessage('Статья удалена.');
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить статью.');
    }
  };

  if (loading) return <div className={styles.status}>Загружаем блог...</div>;

  return (
    <div className={styles.adminPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Блог</span>
          <h1>Статьи и советы</h1>
          <p>Редактирование материалов для читателей.</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/admin">Админ-панель</Link>
          <Link to="/blog">Открыть блог</Link>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>{form.id ? 'Редактирование' : 'Новая статья'}</span>
            <h2>Материал блога</h2>
          </div>
          <form className={styles.teaForm} onSubmit={handleSubmit}>
            <label>
              <span>Заголовок</span>
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              <span>Раздел</span>
              <select name="blog_category_id" value={form.blog_category_id} onChange={handleChange} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Slug</span>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="Можно оставить пустым" />
            </label>
            <label>
              <span>Изображение</span>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://... или /img/..." />
            </label>
            <label className={styles.fullField}>
              <span>Краткое описание</span>
              <textarea name="excerpt" rows="3" value={form.excerpt} onChange={handleChange} />
            </label>
            <label className={styles.fullField}>
              <span>Текст статьи</span>
              <textarea name="content" rows="12" value={form.content} onChange={handleChange} required />
            </label>
            <label>
              <span>Публикация</span>
              <select name="is_published" value={form.is_published ? '1' : '0'} onChange={(event) => setForm((currentForm) => ({ ...currentForm, is_published: event.target.value === '1' }))}>
                <option value="1">Опубликована</option>
                <option value="0">Черновик</option>
              </select>
            </label>
            <div className={styles.formActions}>
              <button type="submit" disabled={saving}>{saving ? 'Сохраняем...' : (form.id ? 'Сохранить' : 'Добавить статью')}</button>
              {form.id && <button type="button" onClick={resetForm}>Отмена</button>}
            </div>
            {message && <p className={styles.formMessage}>{message}</p>}
            {error && <p className={`${styles.formMessage} ${styles.formMessageError}`}>{error}</p>}
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Материалы</span>
            <h2>Список статей</h2>
          </div>
          <div className={styles.tableList}>
            {posts.map((post) => (
              <div className={styles.tableRow} key={post.id}>
                <div>
                  <strong>{post.title}</strong>
                  <span>{post.category?.name || 'Без раздела'} / {post.is_published ? 'Опубликована' : 'Черновик'}</span>
                </div>
                <div className={styles.tableActions}>
                  <button type="button" onClick={() => editPost(post)}>Изменить</button>
                  <button type="button" onClick={() => deletePost(post)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBlogPage;
