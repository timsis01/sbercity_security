/**
 * Карточка товара: цена, покупка или запрос цены, описание, характеристики и похожие товары.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/endpoints";
import type { ProductDetail } from "../api/types";
import { PriceTag, ProductBadges } from "../components/catalog/ProductCard";
import { ProductGrid } from "../components/catalog/ProductGrid";
import { ProductVisual } from "../components/catalog/ProductVisual";
import { QuantityInput } from "../components/catalog/QuantityInput";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import type { Crumb } from "../components/ui/Breadcrumbs";
import { Button, ButtonLink } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { SectionHeading } from "../components/ui/SectionHeading";
import { EmptyState, ErrorState, Loader } from "../components/ui/States";
import { useCart } from "../context/CartContext";
import { useUi } from "../context/UiContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./ProductPage.module.css";

/** Вкладка карточки товара. */
type Tab = "description" | "specs";

/**
 * Блок покупки: количество, «В корзину», «Купить сейчас» или запрос цены.
 *
 * @param props Товар.
 * @returns Панель действий.
 */
function BuyBox({ product }: { product: ProductDetail }): ReactNode {
  const [quantity, setQuantity] = useState<number>(1);
  const { add, lines } = useCart();
  const { notify, openCallback } = useUi();
  const navigate = useNavigate();
  const inCart = lines.find((line) => line.slug === product.slug);

  if (product.is_price_on_request) {
    return (
      <div className={styles.buy}>
        <p className="muted">Стоимость зависит от объёма и условий поставки — менеджер рассчитает цену под ваш объект.</p>
        <div className={styles.buyActions}>
          <Button size="lg" onClick={() => openCallback({ topic: "price", product })}>
            Запросить цену
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.buy}>
      <div className={styles.buyActions}>
        <QuantityInput value={quantity} onChange={setQuantity} label="Количество товара" />
        <Button
          size="lg"
          onClick={() => {
            add(product, quantity);
            notify(`Добавлено в корзину: ${quantity} шт.`);
          }}
        >
          <Icon name="cart" size={18} />В корзину
        </Button>
        <Button
          size="lg"
          variant="dark"
          onClick={() => {
            add(product, quantity);
            navigate("/checkout");
          }}
        >
          Купить
        </Button>
      </div>
      <div className={styles.buyLinks}>
        <Button variant="ghost" onClick={() => openCallback({ topic: "quick_order", product })}>
          Быстрый заказ по телефону
        </Button>
        {inCart ? (
          <ButtonLink to="/cart" variant="ghost">
            В корзине: {inCart.quantity} шт. — перейти
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Страница товара.
 *
 * @returns Разметка карточки товара.
 */
export function ProductPage(): ReactNode {
  const { slug = "" } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("description");
  const { data: product, error, loading, reload } = useAsync(() => api.product(slug), [slug]);
  const related = useAsync(() => api.relatedProducts(slug), [slug]);
  useDocumentTitle(product?.title ?? "Товар");

  if (error?.status === 404) {
    return (
      <div className="page container page-head">
        <EmptyState title="Товар не найден" text="Возможно, он снят с продажи." action={<ButtonLink to="/catalog">Перейти в каталог</ButtonLink>} />
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
  if (loading || !product) {
    return (
      <div className="page container page-head">
        <Loader />
      </div>
    );
  }

  const crumbs: Crumb[] = [
    { label: "Каталог", to: "/catalog" },
    ...product.breadcrumbs.map((crumb) => ({ label: crumb.name, to: `/catalog/${crumb.slug}` })),
    { label: product.title },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className={styles.top}>
          <div className={styles.gallery}>
            <ProductVisual categorySlug={product.category.slug} visual={product.visual} image={product.image} title={product.title} size="large" />
            <ProductBadges product={product} />
          </div>
          <div className={styles.info}>
            <span className="eyebrow">{product.category.name}</span>
            <h1 className={styles.title}>{product.title}</h1>
            <dl className={styles.meta}>
              {product.sku ? (
                <div>
                  <dt>Артикул</dt>
                  <dd>{product.sku}</dd>
                </div>
              ) : null}
              {product.brand ? (
                <div>
                  <dt>Бренд</dt>
                  <dd>{product.brand}</dd>
                </div>
              ) : null}
              {product.manufacturer ? (
                <div>
                  <dt>Производитель</dt>
                  <dd>{product.manufacturer}</dd>
                </div>
              ) : null}
              <div>
                <dt>Наличие</dt>
                <dd className={product.in_stock ? styles.inStock : ""}>{product.in_stock ? "В наличии" : "Под заказ"}</dd>
              </div>
            </dl>
            <PriceTag product={product} large />
            <BuyBox product={product} />
            <ul className={styles.perks}>
              <li>
                <Icon name="truck" />
                Доставка по всей России, самовывоз — бесплатно
              </li>
              <li>
                <Icon name="shield" />
                Официальная гарантия производителя
              </li>
              <li>
                <Icon name="percent" />
                Скидка до 15% на объём — обсудите с менеджером
              </li>
            </ul>
          </div>
        </div>
        <section className={styles.details} aria-label="Подробности о товаре">
          <div className={styles.tabs} role="tablist" aria-label="Разделы карточки">
            <button type="button" role="tab" id="tab-description" aria-selected={tab === "description"} aria-controls="panel-description" className={styles.tab} onClick={() => setTab("description")}>
              Описание
            </button>
            <button type="button" role="tab" id="tab-specs" aria-selected={tab === "specs"} aria-controls="panel-specs" className={styles.tab} onClick={() => setTab("specs")}>
              Характеристики
            </button>
          </div>
          {tab === "description" ? (
            <div id="panel-description" role="tabpanel" aria-labelledby="tab-description" className={styles.panel}>
              <div className="prose">
                {(product.description || "Описание появится в ближайшее время.").split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {product.requirements ? (
                <div className={styles.requirements}>
                  <span className="eyebrow">Обязательно наличие</span>
                  <p>{product.requirements}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div id="panel-specs" role="tabpanel" aria-labelledby="tab-specs" className={styles.panel}>
              {product.specs.length > 0 ? (
                <table className={styles.specs}>
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.name}>
                        <th scope="row">{spec.name}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted">Характеристики уточняйте у менеджера.</p>
              )}
            </div>
          )}
        </section>
        {related.data && related.data.length > 0 ? (
          <section className={styles.related} aria-labelledby="related-title">
            <SectionHeading eyebrow="Из этой категории" title="Похожие товары" id="related-title" />
            <ProductGrid products={related.data} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
