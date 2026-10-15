import styles from './InfoPage.module.css';

const ContactsPage = () => (
  <div className={styles.infoPage}>
    <section className={styles.hero}>
      <span className={styles.kicker}>Связь</span>
      <h1>Контакты</h1>
      <p>Свяжитесь с нами по заказам, доставке, подбору чая и чайной церемонии.</p>
    </section>

    <section className={styles.contactGrid}>
      <article>
        <span>Telegram</span>
        <strong>@tea_podnebes</strong>
      </article>
      <article>
        <span>Instagram</span>
        <strong>@tea_list_podnebes</strong>
      </article>
      <article>
        <span>Адрес</span>
        <strong>Уточняется при подтверждении заказа</strong>
      </article>
      <article>
        <span>Время ответа</span>
        <strong>Ежедневно, 10:00-20:00</strong>
      </article>
    </section>
  </div>
);

export default ContactsPage;
