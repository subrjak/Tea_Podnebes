import { useState, useEffect } from 'react';
import api from '../../api/api';
import styles from './CatalogPage.module.css';
import TeaCard from '../../components/TeaCard';
import "../../components/componetns_style/TeaCard.css"

const CatalogPage = () => {
    const [teas, setTeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTeas = async () => {
        try {
            const res = await api.get('/teas');
            setTeas(res.data.data || res.data);
        } catch (err) {
            setError('Не удалось загрузить каталог');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeas();
    }, []);

    const handleAddToCart = (tea) => {
        console.log('Добавить в корзину:', tea.name);
        alert(`Товар "${tea.name}" добавлен в корзину (заглушка)`);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles['catalog-page']}>
            <div className={styles['catalog-grid']}>
                {teas.map(tea => (
                    <TeaCard key={tea.id} tea={tea} onAddToCart={handleAddToCart} />
                ))}
            </div>
        </div>
    );
};

export default CatalogPage;