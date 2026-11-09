/**
 * Хлебные крошки навигации.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";

/** Элемент пути. */
export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Отрисовывает путь от главной страницы до текущей.
 *
 * @param props Элементы пути; последний отображается без ссылки.
 * @returns Навигация.
 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }): ReactNode {
  const all: Crumb[] = [{ label: "Главная", to: "/" }, ...items];
  return (
    <nav aria-label="Хлебные крошки" className={styles.nav}>
      <ol className={styles.list}>
        {all.map((item, index) => {
          const last = index === all.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.to && !last ? (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
