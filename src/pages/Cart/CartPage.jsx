import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContexts';
import { useCart } from '../../contexts/CartContext';
import { getWeightLabel } from '../../utils/teaWeights';
import styles from './CartPage.module.css';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} \u20B8`;
const formatWeight = (value) => `${Number(value || 0).toLocaleString('ru-RU')} г`;

const CartPage = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    items,
    totalQuantity,
    totalWeight,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();
  const discountPercent = Number(user?.discount_percent) || 0;
  const discountedTotal = Math.round(totalPrice * (100 - discountPercent) / 100);

  if (!items.length) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.kicker}>Корзина</span>
        <h1>Корзина пуста</h1>
        <p>Добавьте несколько чаев из каталога, и они появятся здесь.</p>
        <Link className={styles.catalogLink} to="/catalog">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Корзина</span>
          <h1>Ваш заказ</h1>
          <p>{totalQuantity} шт. / {formatWeight(totalWeight)}</p>
        </div>
        <Link className={styles.catalogLink} to="/catalog">
          Продолжить покупки
        </Link>
      </section>

      <div className={styles.layout}>
        <section className={styles.itemsPanel} aria-label="Товары в корзине">
          {items.map((item) => (
            <article className={styles.cartItem} key={item.cartKey}>
              <Link className={styles.imageLink} to={`/tea/${item.slug}`}>
                <img src={item.image} alt={item.name} />
              </Link>

              <div className={styles.itemInfo}>
                <Link to={`/tea/${item.slug}`}>{item.name}</Link>
                <div className={styles.itemMeta}>
                  <span>{item.category?.name || 'Без категории'}</span>
                  <span>Фасовка: {getWeightLabel(item.weight)}</span>
                  <span>На складе: {item.stock} шт.</span>
                  <span>{formatPrice(item.linePrice)} за шт.</span>
                </div>
              </div>

              <div className={styles.itemControls}>
                <div className={styles.quantity} aria-label={`Количество ${item.name}`}>
                  <button type="button" onClick={() => decrementItem(item.cartKey)} aria-label="Уменьшить количество">
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    disabled={item.stock > 0 && item.quantity >= item.stock}
                    onClick={() => incrementItem(item.cartKey)}
                    aria-label="Увеличить количество"
                  >
                    +
                  </button>
                </div>
                <strong className={styles.itemTotal}>{formatPrice(item.linePrice * item.quantity)}</strong>
                <button className={styles.removeButton} type="button" onClick={() => removeItem(item.cartKey)}>
                  Убрать
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className={styles.summaryPanel} aria-label="Итого">
          <h2>Итого</h2>
          <div className={styles.summaryRow}>
            <span>Позиции</span>
            <strong>{totalQuantity} шт.</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Общий вес</span>
            <strong>{formatWeight(totalWeight)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Сумма</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>{user?.customer_status || 'Статус после входа'}</span>
            <strong>{isAuthenticated && discountPercent > 0 ? `-${discountPercent}%` : 'Без скидки'}</strong>
          </div>
          <div className={styles.summaryTotal}>
            <span>К оплате</span>
            <strong>{formatPrice(isAuthenticated ? discountedTotal : totalPrice)}</strong>
          </div>
          <Link className={styles.checkoutButton} to={isAuthenticated ? '/checkout' : '/login'}>
            {isAuthenticated ? 'Оформить заказ' : 'Войти для оформления'}
          </Link>
          <p className={styles.summaryHint}>
            На следующем шаге укажите контакты, адрес доставки и выберите оплату: QR онлайн или наличными при получении.
          </p>
          <button className={styles.clearButton} type="button" onClick={clearCart}>
            Очистить корзину
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
