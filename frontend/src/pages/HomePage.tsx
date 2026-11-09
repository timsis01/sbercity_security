/**
 * Главная страница: акции, направления, популярные товары, преимущества, скидки, новости и заявка.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/endpoints";
import { ProductGrid } from "../components/catalog/ProductGrid";
import { CallbackForm } from "../components/forms/CallbackForm";
import { SubscribeForm } from "../components/forms/SubscribeForm";
import { Hero } from "../components/home/Hero";
import { PromoSlider } from "../components/home/PromoSlider";
import { NewsCard } from "../components/news/NewsCard";
import { Button, ButtonLink } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import type { IconName } from "../components/ui/Icon";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ErrorState, Loader } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { pluralize } from "../lib/format";
import styles from "./HomePage.module.css";

const POPULAR_STEP = 8;

/** Показатель в полосе цифр. */
interface Stat {
  value: string;
  label: string;
}

const stats: readonly Stat[] = [
  { value: "до 15 %", label: "скидка на объём" },
  { value: "10 лет", label: "гарантия на автономное пожаротушение" },
  { value: "0,9 с", label: "срабатывание устройств ИНТЕЛЛЕКТ" },
  { value: "85+", label: "регионов доставки" },
];

/** Преимущество магазина. */
interface Benefit {
  icon: IconName;
  value: string;
  title: string;
  text: string;
}

const benefits: readonly Benefit[] = [
  { icon: "percent", value: "до 10 %", title: "Дешевле поставщика", text: "Цены ниже, чем у официального поставщика, на лицензии и оборудование." },
  { icon: "chip", value: "до 15 %", title: "Скидка на объём", text: "Обсудите крупную покупку с менеджером — подготовим индивидуальное предложение." },
  { icon: "shield", value: "2026", title: "Современное ПО", text: "Актуальные версии модулей VIDEOSAPIENS® уже в нашем магазине." },
  { icon: "user", value: "−5 %", title: "Партнёрская схема", text: "Порекомендуйте нас коллегам и получите промокод на следующий заказ." },
];

/**
 * Блок популярных товаров с кнопкой «Показать ещё».
 *
 * @returns Секция популярных товаров.
 */
function PopularProducts(): ReactNode {
  const [pageSize, setPageSize] = useState<number>(POPULAR_STEP);
  const { data, error, loading, reload } = useAsync((signal) => api.products({ page_size: pageSize, ordering: "-popularity" }, signal), [pageSize]);

  return (
    <section className="section" aria-labelledby="popular-title">
      <div className="container">
        <SectionHeading
          eyebrow={data ? `Всего ${data.count} ${pluralize(data.count, ["товар", "товара", "товаров"])}` : "Каталог"}
          title="Популярное"
          id="popular-title"
          action={
            <ButtonLink to="/catalog" variant="outline">
              Весь каталог
            </ButtonLink>
          }
        />
        {error && !data ? <ErrorState message={error.message} onRetry={reload} /> : null}
        {data ? <ProductGrid products={data.results} /> : loading ? <Loader /> : null}
        {data && data.results.length < data.count ? (
          <div className={styles.more}>
            <Button variant="dark" loading={loading} onClick={() => setPageSize((size) => size + POPULAR_STEP)}>
              Показать ещё
            </Button>
            <span className="muted">
              Показано {data.results.length} из {data.count}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Направления каталога — корневые категории.
 *
 * @returns Секция направлений.
 */
function Directions(): ReactNode {
  const { data } = useAsync(() => api.categories(), []);
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <section className="section section--dark" aria-labelledby="directions-title">
      <div className="container">
        <SectionHeading eyebrow="Решения" title="Направления" id="directions-title" tone="dark" />
        <ul className={styles.directions}>
          {data.map((category, index) => (
            <li key={category.slug}>
              <Link to={`/catalog/${category.slug}`} className={styles.direction}>
                <span className={styles.directionIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.directionName}>{category.name}</span>
                <span className={styles.directionCount}>
                  {category.product_count} {pluralize(category.product_count, ["позиция", "позиции", "позиций"])}
                </span>
                <Icon name="arrow-right" className={styles.directionArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Последние новости.
 *
 * @returns Секция новостей.
 */
function LatestNews(): ReactNode {
  const { data } = useAsync(() => api.news(1, 3), []);
  if (!data || data.results.length === 0) {
    return null;
  }
  return (
    <section className="section" aria-labelledby="news-title">
      <div className="container">
        <SectionHeading
          eyebrow="Блог"
          title="Новости"
          id="news-title"
          action={
            <ButtonLink to="/news" variant="outline">
              Все новости
            </ButtonLink>
          }
        />
        <div className={`grid ${styles.newsGrid}`}>
          {data.results.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Главная страница.
 *
 * @returns Разметка главной.
 */
export function HomePage(): ReactNode {
  useDocumentTitle(null);
  return (
    <>
      <Hero />
      <div className={styles.promoWrap}>
        <div className="container">
          <PromoSlider />
        </div>
      </div>
      <section className={styles.stats} aria-label="Ключевые цифры">
        <div className="container">
          <ul className={styles.statList}>
            {stats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <PopularProducts />
      <Directions />
      <section className="section section--cloud" aria-labelledby="benefits-title">
        <div className="container">
          <SectionHeading eyebrow="Почему мы" title="Выгодно и надёжно" id="benefits-title" />
          <ul className={`grid ${styles.benefits}`}>
            {benefits.map((benefit) => (
              <li key={benefit.title} className={styles.benefit}>
                <Icon name={benefit.icon} size={28} className={styles.benefitIcon} />
                <span className={styles.benefitValue}>{benefit.value}</span>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className="muted">{benefit.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section" aria-labelledby="discounts-title">
        <div className={`container ${styles.discounts}`}>
          <div>
            <span className="eyebrow">Скидки</span>
            <h2 id="discounts-title" className="h2" style={{ marginTop: 12 }}>
              Следите за новостями — получайте скидки
            </h2>
            <p className="lead" style={{ marginTop: 16 }}>
              Подпишитесь, чтобы первыми узнавать о снижении цен, новых модулях и персональных промокодах.
            </p>
          </div>
          <SubscribeForm />
        </div>
      </section>
      <LatestNews />
      <section className="section section--dark" aria-labelledby="cta-title">
        <div className={`container ${styles.cta}`}>
          <div>
            <span className="eyebrow">Заявка</span>
            <h2 id="cta-title" className="h2" style={{ marginTop: 12 }}>
              Поможем подобрать решение
            </h2>
            <p className={styles.ctaText}>
              Не нашли нужное в каталоге или не уверены, какие лицензии нужны? Оставьте телефон — инженер перезвонит и подготовит спецификацию под ваш объект.
            </p>
          </div>
          <CallbackForm topic="consultation" tone="dark" submitLabel="Получить консультацию" />
        </div>
      </section>
    </>
  );
}
