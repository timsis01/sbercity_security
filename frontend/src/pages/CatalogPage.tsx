/**
 * Каталог: дерево категорий, поиск, сортировка, фильтр «лидеры продаж» и подгрузка.
 * Параметры поиска хранятся в адресной строке, чтобы ссылкой можно было поделиться.
 */
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api/endpoints";
import type { CategoryNode } from "../api/types";
import { ProductGrid } from "../components/catalog/ProductGrid";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import type { Crumb } from "../components/ui/Breadcrumbs";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { EmptyState, ErrorState, Loader } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { pluralize } from "../lib/format";
import styles from "./CatalogPage.module.css";

const PAGE_STEP = 12;
const DESKTOP_QUERY = "(min-width: 961px)";

/** Вариант сортировки. */
interface SortOption {
  value: string;
  label: string;
}

/** Доступные сортировки списка товаров. */
export const sortOptions: readonly SortOption[] = [
  { value: "-popularity", label: "По популярности" },
  { value: "price", label: "Сначала дешевле" },
  { value: "-price", label: "Сначала дороже" },
  { value: "title", label: "По названию" },
];

/**
 * Рекурсивное меню категорий.
 *
 * @param props Узлы дерева и уровень вложенности.
 * @returns Список ссылок.
 */
function CategoryTree({ nodes, level = 0 }: { nodes: readonly CategoryNode[]; level?: number }): ReactNode {
  return (
    <ul className={level === 0 ? styles.tree : styles.subtree}>
      {nodes.map((node) => (
        <li key={node.slug}>
          <NavLink to={`/catalog/${node.slug}`} className={({ isActive }) => `${styles.treeLink} ${isActive ? styles.treeActive : ""}`}>
            <span>{node.name}</span>
            <span className={styles.treeCount}>{node.product_count}</span>
          </NavLink>
          {node.children.length > 0 ? <CategoryTree nodes={node.children} level={level + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Страница каталога для всех товаров или конкретной категории.
 *
 * @returns Разметка каталога.
 */
export function CatalogPage(): ReactNode {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const ordering = params.get("sort") ?? "-popularity";
  const bestsellers = params.get("best") === "1";
  const [pageSize, setPageSize] = useState<number>(PAGE_STEP);
  const [searchDraft, setSearchDraft] = useState<string>(search);
  const [treeOpen, setTreeOpen] = useState<boolean>(() => window.matchMedia?.(DESKTOP_QUERY).matches ?? true);

  useEffect(() => {
    setPageSize(PAGE_STEP);
  }, [slug, search, ordering, bestsellers]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const tree = useAsync(() => api.categories(), []);
  const category = useAsync(() => (slug ? api.category(slug) : Promise.resolve(null)), [slug]);
  const products = useAsync(
    (signal) =>
      api.products(
        {
          category: slug,
          search: search || undefined,
          ordering,
          page_size: pageSize,
          is_bestseller: bestsellers || undefined,
        },
        signal,
      ),
    [slug, search, ordering, pageSize, bestsellers],
  );

  const title = slug ? (category.data?.name ?? "Каталог") : "Каталог";
  useDocumentTitle(title);

  const updateParam = (key: string, value: string | null): void => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const onSearch = (event: FormEvent): void => {
    event.preventDefault();
    updateParam("q", searchDraft.trim() || null);
  };

  const crumbs: Crumb[] = [{ label: "Каталог", to: "/catalog" }];
  if (slug && category.data) {
    for (const crumb of category.data.breadcrumbs) {
      crumbs.push({ label: crumb.name, to: `/catalog/${crumb.slug}` });
    }
  }

  const notFound = slug && category.error?.status === 404;

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={crumbs} />
          <h1 className="h1">{title}</h1>
          {category.data?.description ? <p className="lead">{category.data.description}</p> : null}
        </header>
        {notFound ? (
          <EmptyState title="Категория не найдена" text="Возможно, раздел переименован. Посмотрите весь каталог." />
        ) : (
          <div className={styles.layout}>
            <aside className={styles.sidebar} aria-label="Категории каталога">
              <details open={treeOpen} onToggle={(event) => setTreeOpen(event.currentTarget.open)}>
                <summary className={styles.treeSummary}>Категории</summary>
                <NavLink to="/catalog" end className={({ isActive }) => `${styles.treeLink} ${styles.treeRoot} ${isActive ? styles.treeActive : ""}`}>
                  Все товары
                </NavLink>
                {tree.data ? <CategoryTree nodes={tree.data} /> : null}
              </details>
            </aside>
            <section className={styles.content} aria-label="Товары">
              <div className={styles.toolbar}>
                <form className={styles.search} role="search" onSubmit={onSearch}>
                  <label htmlFor="catalog-search" className="visually-hidden">
                    Поиск по каталогу
                  </label>
                  <Icon name="search" className={styles.searchIcon} />
                  <input
                    id="catalog-search"
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Название, артикул или бренд"
                    className={styles.searchInput}
                  />
                  <Button type="submit" size="sm" variant="dark">
                    Найти
                  </Button>
                </form>
                <div className={styles.filters}>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={bestsellers} onChange={(event) => updateParam("best", event.target.checked ? "1" : null)} />
                    <span>Лидеры продаж</span>
                  </label>
                  <label className={styles.sort}>
                    <span className="visually-hidden">Сортировка</span>
                    <select value={ordering} onChange={(event) => updateParam("sort", event.target.value === "-popularity" ? null : event.target.value)}>
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              {products.data ? (
                <p className={styles.count} aria-live="polite">
                  {search ? `По запросу «${search}» найдено` : "Найдено"} {products.data.count}{" "}
                  {pluralize(products.data.count, ["товар", "товара", "товаров"])}
                </p>
              ) : null}
              {products.error && !products.data ? <ErrorState message={products.error.message} onRetry={products.reload} /> : null}
              {!products.data && products.loading ? <Loader /> : null}
              {products.data && products.data.results.length === 0 ? (
                <EmptyState
                  title="Ничего не найдено"
                  text="Попробуйте изменить запрос или сбросить фильтры."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                      Сбросить фильтры
                    </Button>
                  }
                />
              ) : null}
              {products.data && products.data.results.length > 0 ? <ProductGrid products={products.data.results} /> : null}
              {products.data && products.data.results.length < products.data.count ? (
                <div className={styles.more}>
                  <Button variant="dark" loading={products.loading} onClick={() => setPageSize((size) => size + PAGE_STEP)}>
                    Показать ещё
                  </Button>
                  <span className="muted">
                    Показано {products.data.results.length} из {products.data.count}
                  </span>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
