/**
 * Карточка товара в сетке каталога.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ProductListItem } from "../../api/types";
import { useCart } from "../../context/CartContext";
import { useUi } from "../../context/UiContext";
import { formatPrice } from "../../lib/format";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ProductVisual } from "./ProductVisual";
import styles from "./ProductCard.module.css";

/**
 * Метки товара: лидер продаж, новинка, скидка.
 *
 * @param props Товар.
 * @returns Список меток или `null`.
 */
export function ProductBadges({ product }: { product: ProductListItem }): ReactNode {
  const badges: { key: string; label: string; tone: "accent" | "dark" | "light" }[] = [];
  if (product.is_bestseller) {
    badges.push({ key: "best", label: "Лидер продаж", tone: "accent" });
  }
  if (product.is_new) {
    badges.push({ key: "new", label: "Новинка", tone: "dark" });
  }
  if (product.old_price && product.price && Number(product.old_price) > Number(product.price)) {
    const percent = Math.round((1 - Number(product.price) / Number(product.old_price)) * 100);
    badges.push({ key: "sale", label: `−${percent}%`, tone: "light" });
  }
  if (badges.length === 0) {
    return null;
  }
  return (
    <ul className={styles.badges} aria-label="Метки товара">
      {badges.map((badge) => (
        <li key={badge.key} className={`${styles.badge} ${styles[badge.tone]}`}>
          {badge.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Цена товара со старой ценой, если есть скидка.
 *
 * @param props Товар и размер.
 * @returns Блок цены.
 */
export function PriceTag({ product, large = false }: { product: ProductListItem; large?: boolean }): ReactNode {
  return (
    <div className={`${styles.price} ${large ? styles.priceLarge : ""}`}>
      <span className={product.is_price_on_request ? styles.onRequest : styles.current}>{formatPrice(product.price)}</span>
      {product.old_price && product.price ? <s className={styles.old}>{formatPrice(product.old_price)}</s> : null}
    </div>
  );
}

/**
 * Карточка товара с кнопкой покупки или запроса цены.
 *
 * @param props Товар.
 * @returns Карточка.
 */
export function ProductCard({ product }: { product: ProductListItem }): ReactNode {
  const { add } = useCart();
  const { notify, openCallback } = useUi();
  const url = `/product/${product.slug}`;

  return (
    <article className={styles.card} data-testid="product-card">
      <Link to={url} className={styles.media} tabIndex={-1} aria-hidden="true">
        <ProductVisual categorySlug={product.category.slug} visual={product.visual} image={product.image} title={product.title} />
      </Link>
      <ProductBadges product={product} />
      <div className={styles.body}>
        <span className={styles.category}>{product.category.name}</span>
        <h3 className={styles.title}>
          <Link to={url}>{product.title}</Link>
        </h3>
        {product.sku ? <span className={styles.sku}>Арт. {product.sku}</span> : null}
        <div className={styles.footer}>
          <PriceTag product={product} />
          {product.is_price_on_request ? (
            <Button variant="outline" size="sm" onClick={() => openCallback({ topic: "price", product })}>
              Запросить цену
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                add(product);
                notify(`«${product.title}» добавлен в корзину`);
              }}
              aria-label={`В корзину: ${product.title}`}
            >
              <Icon name="cart" size={16} />В корзину
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
