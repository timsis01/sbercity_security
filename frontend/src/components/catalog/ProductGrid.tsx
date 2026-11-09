/**
 * Сетка карточек товаров с разделителями в 1px.
 */
import type { ReactNode } from "react";
import type { ProductListItem } from "../../api/types";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

/**
 * Отрисовывает список товаров сеткой.
 *
 * @param props Товары.
 * @returns Сетка.
 */
export function ProductGrid({ products }: { products: readonly ProductListItem[] }): ReactNode {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.slug} className={styles.cell}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
