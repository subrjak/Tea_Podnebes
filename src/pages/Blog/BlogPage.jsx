import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import styles from './BlogPage.module.css';

const BlogPage = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/blog', {
      params: selectedCategory === 'all' ? {} : { category: selectedCategory },
    })
      .then((res) => {
        setCategories(res.data.categories || []);
        setPosts(res.data.posts || []);
      })
      .catch(() => setError('Не удалось загрузить блог.'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (loading) return <div className={styles.status}>Загружаем блог...</div>;
  if (error) return <div className={`${styles.status} ${styles.error}`}>{error}</div>;

  return (
    <div className={styles.blogPage}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Блог</span>
        <h1>Чайные заметки и советы</h1>
        <p>Разбираемся в сортах, способах заваривания и спокойных чайных привычках.</p>
      </section>

      <div className={styles.tabs}>
        <button
          className={selectedCategory === 'all' ? styles.activeTab : ''}
          type="button"
          onClick={() => setSelectedCategory('all')}
        >
          Все разделы
        </button>
        {categories.map((category) => (
          <button
            className={selectedCategory === category.slug ? styles.activeTab : ''}
            key={category.slug}
            type="button"
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {posts.length ? (
        <div className={styles.postsGrid}>
          {posts.map((post) => (
            <Link className={styles.postCard} key={post.id} to={`/blog/${post.slug}`}>
              {post.image && <img src={post.image} alt={post.title} />}
              <div className={styles.postBody}>
                <em>{post.category?.name || 'Статья'}</em>
                <h2>{post.title}</h2>
                <p>{post.excerpt || 'Открыть статью'}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className={styles.panel}>
          <p className={styles.emptyText}>В этом разделе пока нет статей.</p>
        </section>
      )}
    </div>
  );
};

export default BlogPage;
