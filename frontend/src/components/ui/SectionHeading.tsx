/**
 * Заголовок секции с надзаголовком и необязательной ссылкой справа.
 */
import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

/** Свойства заголовка секции. */
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  id?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}

/**
 * Отрисовывает заголовок секции.
 *
 * @param props Надзаголовок, заголовок, якорь, действие и цветовая схема.
 * @returns Шапка секции.
 */
export function SectionHeading({ eyebrow, title, id, action, tone = "light" }: SectionHeadingProps): ReactNode {
  return (
    <div className={`${styles.head} ${tone === "dark" ? styles.dark : ""}`}>
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 id={id} className={`h2 ${styles.title}`}>
          {title}
        </h2>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
