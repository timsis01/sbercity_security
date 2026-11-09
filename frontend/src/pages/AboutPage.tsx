/**
 * Страница «О нас»: о компании, возможности, партнёры и отзывы.
 */
import type { ReactNode } from "react";
import { api } from "../api/endpoints";
import { ReviewForm } from "../components/forms/ReviewForm";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Icon } from "../components/ui/Icon";
import type { IconName } from "../components/ui/Icon";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatDate, pluralize } from "../lib/format";
import styles from "./AboutPage.module.css";

/** Возможность компании. */
interface Capability {
  icon: IconName;
  text: string;
}

const capabilities: readonly Capability[] = [
  { icon: "clock", text: "Быстрая обработка запросов" },
  { icon: "percent", text: "Гибкая ценовая политика и специальные предложения" },
  { icon: "shield", text: "Квалифицированное обслуживание и сопровождение" },
  { icon: "chip", text: "Профессиональный монтаж систем безопасности" },
  { icon: "check", text: "Официальный дилер ПО VIDEOSAPIENS®" },
];

const partners: readonly string[] = ["VIDEOSAPIENS", "Национальные лаборатории безопасности", "ИНТЕЛЛЕКТ", "Фумароль", "SGTDEC", "MERTECH"];

/**
 * Рейтинг магазина и опубликованные отзывы.
 *
 * @returns Секция отзывов.
 */
function Reviews(): ReactNode {
  const summary = useAsync(() => api.reviewSummary(), []);
  const reviews = useAsync(() => api.reviews(), []);
  const average = summary.data?.average;
  const count = summary.data?.count ?? 0;
  return (
    <section className="section section--cloud" aria-labelledby="reviews-title">
      <div className={`container ${styles.reviews}`}>
        <div>
          <SectionHeading eyebrow="Отзывы" title="Что говорят клиенты" id="reviews-title" />
          <div className={styles.rating} aria-label="Рейтинг магазина">
            <span className={styles.ratingValue}>{average !== null && average !== undefined ? average.toFixed(1) : "—"}</span>
            <span className="muted">
              из 5 на основе {count} {pluralize(count, ["отзыва", "отзывов", "отзывов"])}
            </span>
          </div>
          {reviews.data && reviews.data.results.length > 0 ? (
            <ul className={styles.reviewList}>
              {reviews.data.results.map((review) => (
                <li key={review.id} className={styles.review}>
                  <div className={styles.reviewHead}>
                    <strong>{review.author_name}</strong>
                    <span className={styles.stars} aria-label={`Оценка ${review.rating} из 5`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Icon key={index} name="star" size={16} filled={index < review.rating} />
                      ))}
                    </span>
                    <span className="muted">{formatDate(review.created_at)}</span>
                  </div>
                  <p>{review.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Отзывов пока нет — станьте первым!</p>
          )}
        </div>
        <div className={styles.reviewForm}>
          <h3 className={styles.formTitle}>Оставить отзыв</h3>
          <ReviewForm />
        </div>
      </div>
    </section>
  );
}

/**
 * Страница «О нас».
 *
 * @returns Разметка страницы.
 */
export function AboutPage(): ReactNode {
  useDocumentTitle("О нас");
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "О нас" }]} />
          <h1 className="h1">О компании</h1>
        </header>
        <div className={styles.intro}>
          <p className={styles.introLead}>Мы рады приветствовать вас на сайте «СберСити — безопасность»!</p>
          <div className="prose">
            <p>
              Мы — официальный дилер программного обеспечения VIDEOSAPIENS®, одного из ведущих решений в области видеоаналитики и интеллектуальных систем
              безопасности. Предлагаем полный спектр продуктов VIDEOSAPIENS®, а также монтаж и обслуживание технических систем безопасности (ТСБ) и систем
              противопожарной защиты (ПБ).
            </p>
            <p>
              Компания создана, чтобы предоставлять комплексные IT-решения для безопасности и видеонаблюдения. У нас собственная сервисная служба, опытный отдел
              продаж и техническая поддержка; квалифицированные инженеры обеспечивают установку и сопровождение систем.
            </p>
            <p>Добро пожаловать — вместе сделаем ваш бизнес и объекты безопасными и технологичными!</p>
          </div>
        </div>
        <section className="section" aria-labelledby="capabilities-title">
          <SectionHeading eyebrow="Компетенции" title="Наши возможности" id="capabilities-title" />
          <ul className={`grid ${styles.capabilities}`}>
            {capabilities.map((item) => (
              <li key={item.text} className={styles.capability}>
                <Icon name={item.icon} size={28} />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.partnersSection} aria-labelledby="partners-title">
          <SectionHeading eyebrow="Экосистема" title="Наши партнёры" id="partners-title" />
          <ul className={`grid ${styles.partners}`}>
            {partners.map((partner) => (
              <li key={partner} className={styles.partner}>
                {partner}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Reviews />
    </div>
  );
}
