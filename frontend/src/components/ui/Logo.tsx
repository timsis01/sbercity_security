/**
 * Логотип «СберСити — безопасность»: щит с «объективом» и двухстрочная надпись.
 */
import type { ReactNode } from "react";
import styles from "./Logo.module.css";

/** Свойства логотипа. */
interface LogoProps {
  tone?: "light" | "dark";
}

/**
 * Отрисовывает логотип компании.
 *
 * @param props Цветовая схема: светлая для тёмного фона и наоборот.
 * @returns Логотип.
 */
export function Logo({ tone = "dark" }: LogoProps): ReactNode {
  return (
    <span className={`${styles.logo} ${tone === "light" ? styles.light : ""}`}>
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 3.5 27 8v7.6c0 6.6-4.6 10.6-11 12.4-6.4-1.8-11-5.8-11-12.4V8z" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="16" cy="15.5" r="5.6" fill="none" stroke="var(--c-accent)" strokeWidth="2.2" />
        <circle cx="16" cy="15.5" r="2.2" fill="var(--c-accent)" />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>СберСити</span>
        <span className={styles.tag}>безопасность</span>
      </span>
    </span>
  );
}
