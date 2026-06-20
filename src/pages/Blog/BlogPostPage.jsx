import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContexts';
import styles from './BlogPage.module.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState({ rating: 5, text: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get(`/blog/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => setError('Статья не найдена.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const submitReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.post('/reviews', {
        type: 'post',
        id: post.id,
        rating: Number(review.rating),
        text: review.text,
      });
      setPost((currentPost) => ({
        ...currentPost,
        reviews: [res.data.review, ...(currentPost.reviews || [])],
      }));
      setReview({ rating: 5, text: '' });
      setMessage('Спасибо, отзыв опубликован.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Не удалось отправить отзыв.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.status}>Загружаем статью...</div>;
  if (error) return <div className={`${styles.status} ${styles.error}`}>{error}</div>;

  return (
    <div className={styles.blogPage}>
      <Link className={styles.backLink} to="/blog">Назад в блог</Link>
      <article className={styles.article}>
        <div>
          <span className={styles.kicker}>{post.category?.name || 'Блог'}</span>
          <h1>{post.title}</h1>
          <p className={styles.articleMeta}>
            {post.author?.name ? `Автор: ${post.author.name}` : 'Лист Поднебесной'}
          </p>
        </div>
        {post.image && <img className={styles.articleImage} src={post.image} alt={post.title} />}
        <div className={styles.articleContent}>{post.content}</div>
      </article>

      <section className={styles.panel}>
        <span className={styles.kicker}>Отзывы</span>
        <h2>После прочтения</h2>
        {isAuthenticated ? (
          <form className={styles.reviewForm} onSubmit={submitReview}>
            <select
              value={review.rating}
              onChange={(event) => setReview((currentReview) => ({ ...currentReview, rating: event.target.value }))}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} из 5</option>
              ))}
            </select>
            <textarea
              value={review.text}
              onChange={(event) => setReview((currentReview) => ({ ...currentReview, text: event.target.value }))}
              placeholder="Что оказалось полезным?"
              required
            />
            <button type="submit" disabled={saving}>{saving ? 'Отправляем...' : 'Оставить отзыв'}</button>
            {message && <p className={styles.emptyText}>{message}</p>}
          </form>
        ) : (
          <p className={styles.emptyText}>Войдите в аккаунт, чтобы оставить отзыв.</p>
        )}

        <div className={styles.reviewsList}>
          {(post.reviews || []).map((item) => (
            <div className={styles.reviewItem} key={item.id}>
              <strong>{item.user?.name || 'Пользователь'} / {item.rating} из 5</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;
