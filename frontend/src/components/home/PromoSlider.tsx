/**
 * Слайдер акций главной страницы с автопрокруткой и ручным переключением.
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon";
import type { IconName } from "../ui/Icon";
import styles from "./PromoSlider.module.css";

/** Слайд акции. */
export interface PromoSlide {
  id: string;
  title: string;
  text: string;
  to: string;
  icon: IconName;
}

/** Слайды по умолчанию. */
export const promoSlides: readonly PromoSlide[] = [
  {
    id: "sale",
    title: "Ценопад! Скорее оформляйте заказ",
    text: "Осень — время зарядить бизнес новыми идеями и решениями. Сниженные цены на оборудование и модули VIDEOSAPIENS®.",
    to: "/catalog",
    icon: "percent",
  },
  {
    id: "dealer",
    title: "Официальный дилер VIDEOSAPIENS",
    text: "Партнёрство с ведущими производителями гарантирует качество продукции, конкурентные цены и поддержку от вендора.",
    to: "/catalog/videosapiens",
    icon: "shield",
  },
  {
    id: "delivery",
    title: "Доставка во все регионы России",
    text: "Привезём заказ в любой уголок страны. Лицензии ПО отправляем электронно, оборудование — курьером или самовывозом.",
    to: "/delivery",
    icon: "truck",
  },
];

const INTERVAL_MS = 7000;

/**
 * Слайдер акций.
 *
 * @param props Набор слайдов.
 * @returns Секция со слайдами.
 */
export function PromoSlider({ slides = promoSlides }: { slides?: readonly PromoSlide[] }): ReactNode {
  const [active, setActive] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);

  useEffect(() => {
    if (paused || slides.length < 2) {
      return;
    }
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <section
      className={styles.slider}
      aria-roledescription="карусель"
      aria-label="Акции и предложения"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.track}>
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`${styles.slide} ${index === active ? styles.current : ""}`}
            aria-roledescription="слайд"
            aria-label={`${index + 1} из ${slides.length}`}
            aria-hidden={index !== active}
          >
            <span className={styles.icon}>
              <Icon name={slide.icon} size={28} />
            </span>
            <div className={styles.copy}>
              <h2 className={styles.title}>{slide.title}</h2>
              <p className={styles.text}>{slide.text}</p>
            </div>
            <Link to={slide.to} className={styles.more} tabIndex={index === active ? 0 : -1}>
              Подробнее
              <Icon name="arrow-right" size={16} />
            </Link>
          </article>
        ))}
      </div>
      <div className={styles.dots} role="tablist" aria-label="Выбор слайда">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Слайд ${index + 1}: ${slide.title}`}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}
