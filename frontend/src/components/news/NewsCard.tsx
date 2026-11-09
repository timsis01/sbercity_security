/**
 * Карточка новости в ленте.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ArticleListItem } from "../../api/types";
import { formatDate } from "../../lib/format";
import { Icon } from "../ui/Icon";
import styles from "./NewsCard.module.css";

/**
 * Отрисовывает дату, заголовок и анонс новости.
 *
 * @param props Новость.
 * @returns Карточка.
 */
export function NewsCard({ article }: { article: ArticleListItem }): ReactNode {
  return (
    <article className={styles.card} data-testid="news-card">
      <time className={styles.date} dateTime={article.published_at}>
        {formatDate(article.published_at)}
      </time>
      <h3 className={styles.title}>
        <Link to={`/news/${article.slug}`} className={styles.link}>
          {article.title}
        </Link>
      </h3>
      <p className={styles.excerpt}>{article.excerpt}</p>
      <span className={styles.more} aria-hidden="true">
        Читать
        <Icon name="arrow-right" size={16} />
      </span>
    </article>
  );
}
