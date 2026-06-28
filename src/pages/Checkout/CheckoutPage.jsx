import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContexts';
import { useCart } from '../../contexts/CartContext';
import { getWeightLabel } from '../../utils/teaWeights';
import styles from './CheckoutPage.module.css';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} \u20B8`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { items, totalQuantity, totalWeight, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [qrAvailable, setQrAvailable] = useState(true);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.profile_phone || '',
    telegram: user?.profile_telegram || '',
    address: user?.profile_address || '',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const discountPercent = Number(user?.discount_percent) || 0;
  const discountedTotal = Math.round(totalPrice * (100 - discountPercent) / 100);

  const contactDataFilled = Boolean(
    form.name.trim()
    && form.phone.trim()
    && form.address.trim()
  );

  const orderPayload = useMemo(() => ({
    customer: {
      name: form.name.trim(),
      phone: form.phone.trim(),
      telegram: form.telegram.trim(),
      address: form.address.trim(),
      comment: form.comment.trim(),
    },
    payment_method: paymentMethod,
    items: items.map((item) => ({
      id: item.id,
      weight: item.weight,
      quantity: item.quantity,
    })),
  }), [form, items, paymentMethod]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handlePaymentChange = (method) => {
    if (contactDataFilled) {
      setPaymentMethod(method);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!contactDataFilled) {
      setError('Заполните имя, телефон и адрес доставки перед выбором оплаты.');
      return;
    }

    if (!paymentMethod) {
      setError('Выберите способ оплаты: QR онлайн или наличными при получении.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/orders', orderPayload);
      setCreatedOrder(res.data.order);
      clearCart();
      refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось оформить заказ. Проверьте данные и попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className={styles.successPage}>
        <span className={styles.kicker}>Заказ создан</span>
        <h1>Заказ #{createdOrder.order_number}</h1>
        <p>
          Мы получили заказ и отправили его администратору в Telegram.
          После подтверждения с вами свяжутся для уточнения деталей.
        </p>
        <div className={styles.successActions}>
          <Link to="/catalog">Вернуться в каталог</Link>
          <button type="button" onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.kicker}>Оформление</span>
        <h1>Корзина пуста</h1>
        <p>Добавьте чай в корзину, чтобы оформить заказ.</p>
        <Link to="/catalog">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Оформление</span>
          <h1>Данные заказа</h1>
          <p>{totalQuantity} шт. / {totalWeight.toLocaleString('ru-RU')} г</p>
        </div>
        <Link to="/cart">Вернуться в корзину</Link>
      </section>

      <form className={styles.layout} onSubmit={handleSubmit}>
        <section className={styles.formPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Контакты и доставка</span>
            <h2>Сначала заполните данные получателя</h2>
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span>Имя *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Номер телефона *</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Telegram</span>
              <input
                name="telegram"
                value={form.telegram}
                onChange={handleChange}
                placeholder="@username"
                autoComplete="off"
              />
            </label>
            <label className={`${styles.field} ${styles.fullField}`}>
              <span>Адрес доставки *</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                placeholder="Город, улица, дом, квартира или удобный способ получения"
                required
              />
            </label>
            <label className={`${styles.field} ${styles.fullField}`}>
              <span>Комментарий к заказу</span>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                rows="3"
                placeholder="Например: удобное время доставки, пожелания по связи или упаковке"
              />
            </label>
          </div>

          <div className={styles.paymentPanel}>
            <span className={styles.kicker}>Оплата</span>
            <h2>Выберите способ оплаты</h2>
            {!contactDataFilled && (
              <p className={styles.paymentHint}>
                Способы оплаты станут доступны после заполнения имени, телефона и адреса доставки.
              </p>
            )}

            <div className={styles.paymentOptions}>
              <label className={`${paymentMethod === 'qr' ? styles.activePayment : ''} ${!contactDataFilled ? styles.disabledPayment : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="qr"
                  checked={paymentMethod === 'qr'}
                  disabled={!contactDataFilled}
                  onChange={() => handlePaymentChange('qr')}
                />
                <strong>Оплатить онлайн по QR</strong>
                <span>После выбора покажем QR-код для оплаты банковским приложением.</span>
              </label>
              <label className={`${paymentMethod === 'cash' ? styles.activePayment : ''} ${!contactDataFilled ? styles.disabledPayment : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  disabled={!contactDataFilled}
                  onChange={() => handlePaymentChange('cash')}
                />
                <strong>Наличными при получении</strong>
                <span>Оплата передается курьеру или при самовывозе после получения заказа.</span>
              </label>
            </div>

            {paymentMethod === 'qr' && (
              <div className={styles.qrBox}>
                {qrAvailable ? (
                  <img
                    src="/img/payment/qr.png"
                    alt="QR-код для оплаты заказа"
                    onError={() => setQrAvailable(false)}
                  />
                ) : (
                  <div className={styles.qrPlaceholder}>QR</div>
                )}
                <div>
                  <strong>Сумма к оплате: {formatPrice(discountedTotal)}</strong>
                  <p>После оплаты администратор сверит заказ и подтвердит детали.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className={styles.summaryPanel}>
          <h2>Ваш заказ</h2>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div className={styles.itemRow} key={item.cartKey}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{getWeightLabel(item.weight, item)} x{item.quantity}</span>
                </div>
                <em>{formatPrice(item.linePrice * item.quantity)}</em>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span>Сумма</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <div className={styles.discountRow}>
            <span>{user?.customer_status || 'Обычный покупатель'}</span>
            <strong>{discountPercent > 0 ? `-${discountPercent}%` : 'Без скидки'}</strong>
          </div>
          <div className={styles.totalRow}>
            <span>К оплате</span>
            <strong>{formatPrice(discountedTotal)}</strong>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Отправляем...' : 'Оформить заказ'}
          </button>
          <p className={styles.hint}>После отправки заказ попадет администратору в Telegram.</p>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
