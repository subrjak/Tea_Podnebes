import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './CartPage.module.css';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`;

const CartPage = () => {
  const {
    items,
    totalQuantity,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

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
          <p>{totalQuantity} шт. в корзине</p>
        </div>
        <Link className={styles.catalogLink} to="/catalog">
          Продолжить покупки
        </Link>
      </section>

      <div className={styles.layout}>
        <section className={styles.itemsPanel} aria-label="Товары в корзине">
          {items.map((item) => (
            <article className={styles.cartItem} key={item.id}>
              <Link className={styles.imageLink} to={`/tea/${item.slug}`}>
                <img src={item.image} alt={item.name} />
              </Link>

              <div className={styles.itemInfo}>
                <Link to={`/tea/${item.slug}`}>{item.name}</Link>
                <div className={styles.itemMeta}>
                  <span>{item.category?.name || 'Без категории'}</span>
                </div>
              </div>

              <div className={styles.itemControls}>
                <div className={styles.quantity} aria-label={`Количество ${item.name}`}>
                  <button type="button" onClick={() => decrementItem(item.id)} aria-label="Уменьшить количество">
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => incrementItem(item.id)} aria-label="Увеличить количество">
                    +
                  </button>
                </div>
                <strong className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</strong>
                <button className={styles.removeButton} type="button" onClick={() => removeItem(item.id)}>
                  Убрать
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className={styles.summaryPanel} aria-label="Итого">
          <h2>Итого</h2>
          <div className={styles.summaryRow}>
            <span>Товары</span>
            <strong>{totalQuantity} шт.</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Сумма</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <div className={styles.summaryTotal}>
            <span>К оплате</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <button className={styles.checkoutButton} type="button">
            Оформить заказ
          </button>
          <p className={styles.summaryHint}>
            Оформление заказа можно подключить следующим этапом: контакты, доставка и сохранение заказа на сервере.
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
