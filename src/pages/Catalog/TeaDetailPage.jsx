import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import styles from './DetailPage.module.css';

const TeaDetailPage = () => {
  const { slug } = useParams();
  const [tea, setTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTea = async () => {
      try {
        const res = await api.get(`/teas/${slug}`);
        setTea(res.data);
      } catch (err) {
        setError('Товар не найден');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTea();
  }, [slug]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!tea) return <div>Чай не найден</div>;

  return (
    <div className={styles['tea-detail']}>
      <img src={tea.image || '/placeholder.jpg'} alt={tea.name} />
      <h1>{tea.name}</h1>
      <p><strong>Вид:</strong> {tea.category?.name}</p>
      <p><strong>Описание:</strong> {tea.description}</p>
      <p><strong>Происхождение:</strong> {tea.origin}</p>
      <p><strong>Выдержка:</strong> {tea.age} лет/года</p>
      <p><strong>Цена:</strong> {tea.price} ₸ за 100 грамм</p>
      <p><strong>Температура заваривания:</strong> {tea.brewing_temperature}</p>
      <p><strong>Рекомендуемая посуда:</strong> {tea.recommended_ware}</p>
      <button onClick={() => console.log('Добавить в корзину:', tea.name)}>
        Добавить в корзину
      </button>
    </div>
  );
};

export default TeaDetailPage;