import styles from './InfoPage.module.css';

const questions = [
  {
    question: 'Можно ли оформить заказ без аккаунта?',
    answer: 'Нет. Для оформления нужен профиль, чтобы сохранить историю покупок, статус покупателя и применить персональную скидку.',
  },
  {
    question: 'Как считается скидка?',
    answer: 'Скидка зависит от количества купленных товаров в истории заказов. Чем выше статус, тем больше скидка, максимум 20%.',
  },
  {
    question: 'Почему товар не добавляется в корзину?',
    answer: 'Кнопка блокируется, если товара нет на складе или в корзине уже выбрано всё доступное количество.',
  },
  {
    question: 'Где посмотреть избранное?',
    answer: 'Избранные товары доступны в личном кабинете после входа в аккаунт.',
  },
];

const FaqPage = () => (
  <div className={styles.infoPage}>
    <section className={styles.hero}>
      <span className={styles.kicker}>Помощь</span>
      <h1>F.A.Q</h1>
      <p>Короткие ответы о заказах, профиле, скидках и наличии товаров.</p>
    </section>

    <section className={styles.panel}>
      {questions.map((item) => (
        <article className={styles.question} key={item.question}>
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </article>
      ))}
    </section>
  </div>
);

export default FaqPage;
