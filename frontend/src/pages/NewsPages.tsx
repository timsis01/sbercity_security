/**
 * Лента новостей и страница отдельной новости.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/endpoints";
import { NewsCard } from "../components/news/NewsCard";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Button, ButtonLink } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { EmptyState, ErrorState, Loader } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatLongDate } from "../lib/format";
import styles from "./NewsPages.module.css";

const NEWS_STEP = 9;

/**
 * Лента новостей с подгрузкой.
 *
 * @returns Разметка ленты.
 */
export function NewsListPage(): ReactNode {
  useDocumentTitle("Новости");
  const [pageSize, setPageSize] = useState<number>(NEWS_STEP);
  const { data, error, loading, reload } = useAsync(() => api.news(1, pageSize), [pageSize]);
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "Новости" }]} />
          <h1 className="h1">Новости</h1>
          <p className="lead">Проекты, технологии и события «СберСити — безопасность».</p>
        </header>
        {error && !data ? <ErrorState message={error.message} onRetry={reload} /> : null}
        {!data && loading ? <Loader /> : null}
        {data && data.results.length === 0 ? <EmptyState title="Новостей пока нет" /> : null}
        {data && data.results.length > 0 ? (
          <div className={`grid ${styles.grid}`}>
            {data.results.map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        ) : null}
        {data && data.results.length < data.count ? (
          <div className={styles.more}>
            <Button variant="dark" loading={loading} onClick={() => setPageSize((size) => size + NEWS_STEP)}>
              Показать ещё
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Страница новости.
 *
 * @returns Разметка новости.
 */
export function NewsDetailPage(): ReactNode {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, error, loading, reload } = useAsync(() => api.article(slug), [slug]);
  useDocumentTitle(data?.title ?? "Новость");

  if (error?.status === 404) {
    return (
      <div className="page container page-head">
        <EmptyState title="Новость не найдена" action={<ButtonLink to="/news">Все новости</ButtonLink>} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="page container page-head">
        <ErrorState message={error.message} onRetry={reload} />
      </div>
    );
  }
  if (loading || !data) {
    return (
      <div className="page container page-head">
        <Loader />
      </div>
    );
  }
  return (
    <article className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "Новости", to: "/news" }, { label: data.title }]} />
          <time className="eyebrow" dateTime={data.published_at} style={{ display: "block", marginTop: 24 }}>
            {formatLongDate(data.published_at)}
          </time>
          <h1 className={`h1 ${styles.title}`}>{data.title}</h1>
          <p className="lead">{data.excerpt}</p>
        </header>
        <div className="prose">
          {data.body.split("\n").filter(Boolean).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className={styles.back}>
          <ButtonLink to="/news" variant="outline">
            <Icon name="arrow-left" size={16} />
            Все новости
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
