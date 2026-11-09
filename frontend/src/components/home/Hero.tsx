/**
 * Первый экран главной страницы: панорама города с высоты, как у СберСити,
 * и пульсирующие метки камер — визуальная метафора видеоаналитики.
 */
import type { ReactNode } from "react";
import { useUi } from "../../context/UiContext";
import { Button, ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./Hero.module.css";

/** Положение метки камеры на фото в процентах от ширины и высоты. */
interface CameraMark {
  x: number;
  y: number;
  label: string;
}

const CAMERA_MARKS: readonly CameraMark[] = [
  { x: 55, y: 62, label: "Парк" },
  { x: 67, y: 50, label: "Стадион" },
  { x: 76, y: 35, label: "Двор" },
  { x: 87, y: 59, label: "Набережная" },
  { x: 64, y: 21, label: "Деловой квартал" },
];

/**
 * Первый экран.
 *
 * @returns Секция hero.
 */
export function Hero(): ReactNode {
  const { openCallback } = useUi();
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <picture className={styles.media}>
        <source type="image/webp" srcSet="/images/hero-city-960.webp 960w, /images/hero-city.webp 1920w" sizes="100vw" />
        <img src="/images/hero-city.jpg" alt="" className={styles.photo} fetchPriority="high" decoding="async" />
      </picture>
      <div className={styles.marks} aria-hidden="true">
        {CAMERA_MARKS.map((mark, index) => (
          <span key={mark.label} className={styles.mark} style={{ left: `${mark.x}%`, top: `${mark.y}%`, animationDelay: `${index * 0.7}s` }}>
            <span className={styles.markDot} />
            <span className={styles.markLabel}>{mark.label}</span>
          </span>
        ))}
      </div>
      <div className={`container ${styles.content}`}>
        <span className={styles.eyebrow}>СберСити — безопасность</span>
        <h1 id="hero-title" className={`display ${styles.title}`}>
          Безопасность, которая работает незаметно
        </h1>
        <p className={styles.lead}>
          Видеоаналитика, контроль кассовых операций, распознавание лиц и автономное пожаротушение. Подбираем, поставляем, монтируем и обслуживаем — официальный дилер VIDEOSAPIENS®.
        </p>
        <div className={styles.actions}>
          <ButtonLink to="/catalog" size="lg">
            Перейти в каталог
            <Icon name="arrow-right" size={18} />
          </ButtonLink>
          <Button variant="light" size="lg" onClick={() => openCallback({ topic: "consultation" })}>
            Получить консультацию
          </Button>
        </div>
      </div>
    </section>
  );
}
