import { Link } from 'react-router-dom';
import styles from './CeremonyPage.module.css';

const ceremonySteps = [
  {
    title: 'Подготовьте пространство',
    text: 'Уберите лишнее со стола, прогрейте посуду горячей водой и поставьте рядом всё, что понадобится. В церемонии важна не торжественность, а спокойная собранность.',
  },
  {
    title: 'Пробудите чай',
    text: 'Положите чай в гайвань или чайник и сделайте короткий первый пролив. Его обычно не пьют: он прогревает лист, смывает чайную пыль и раскрывает аромат.',
  },
  {
    title: 'Заваривайте проливами',
    text: 'Заливайте чай горячей водой на короткое время и полностью сливайте настой в чахай. Каждый следующий пролив может быть чуть дольше, а вкус будет постепенно меняться.',
  },
  {
    title: 'Пейте без спешки',
    text: 'Разлейте настой по маленьким пиалам, обратите внимание на аромат, цвет, плотность и послевкусие. Хороший чай раскрывается не сразу, а в последовательности проливов.',
  },
];

const ceremonyTools = [
  'Чай: пуэр, улун, красный, белый или зелёный сорт под настроение.',
  'Гайвань или небольшой чайник для проливного заваривания.',
  'Чахай, чтобы выровнять крепость настоя перед разливом.',
  'Пиалы небольшого объёма для внимательной дегустации.',
  'Чайная доска или поднос для воды и аккуратной подачи.',
  'Чайник с горячей водой и мягкая салфетка для посуды.',
];

function CeremonyPage() {
  return (
    <div className={styles.ceremonyPage}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>Чайная церемония</span>
          <h1>Искусство заваривать чай внимательно</h1>
          <p>
            Китайская чайная церемония помогает увидеть в чае не просто напиток,
            а живой процесс: аромат листа, движение воды, смену вкуса и спокойный ритм общения.
          </p>
          <Link to="/catalog">Выбрать чай для церемонии</Link>
        </div>
        <div className={styles.heroImage}>
          <img src="/img/oolong.jpg" alt="Чайный лист для церемонии" />
        </div>
      </section>

      <section className={styles.articleGrid}>
        <article className={styles.textPanel}>
          <span className={styles.kicker}>История</span>
          <h2>От повседневного напитка к культуре внимания</h2>
          <p>
            Чайная культура Китая складывалась веками. Сначала чай ценили как
            бодрящий настой и лекарственное растение, затем он стал частью
            повседневной жизни, гостеприимства, поэзии и философии.
          </p>
          <p>
            Особое значение получила традиция заваривания проливами: чай готовят
            в небольшой посуде, быстро сливают настой и возвращаются к листу
            снова. Так один и тот же чай раскрывается постепенно: от первого
            лёгкого аромата до плотного вкуса и мягкого послевкусия.
          </p>
        </article>

        <aside className={styles.notePanel}>
          <h2>Главная идея</h2>
          <p>
            Церемония не требует показной сложности. Её смысл в уважении к листу,
            воде, человеку рядом и моменту, в котором всё это встречается.
          </p>
        </aside>
      </section>

      <section className={styles.significance}>
        <div>
          <span className={styles.kicker}>Значимость</span>
          <h2>Почему церемония важна</h2>
        </div>
        <div className={styles.meaningGrid}>
          <article>
            <h3>Вкус раскрывается глубже</h3>
            <p>Короткие проливы показывают разные стороны чая: цветочный верх, сладость, терпкость, минеральность и послевкусие.</p>
          </article>
          <article>
            <h3>Появляется ритм</h3>
            <p>Повторяющиеся действия успокаивают и помогают переключиться с суеты на внимательное присутствие.</p>
          </article>
          <article>
            <h3>Чай объединяет</h3>
            <p>Небольшие пиалы, общий чайник и неспешный разговор делают церемонию естественным способом общения.</p>
          </article>
        </div>
      </section>

      <section className={styles.stepsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Как проводить</span>
          <h2>Базовый порядок церемонии</h2>
        </div>
        <div className={styles.steps}>
          {ceremonySteps.map((step, index) => (
            <article className={styles.step} key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.toolsSection}>
        <div className={styles.toolsImage}>
          <img src="/img/puer.jpg" alt="Чай для проливного заваривания" />
        </div>
        <div className={styles.toolsContent}>
          <span className={styles.kicker}>Что нужно</span>
          <h2>Минимальный набор для начала</h2>
          <ul>
            {ceremonyTools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default CeremonyPage;
