/**
 * Корзина: позиции, количество, промокод и предварительный расчёт.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { OrderSummary, useQuote } from "../components/cart/OrderSummary";
import { PromoCodeForm } from "../components/cart/PromoCodeForm";
import { ProductVisual } from "../components/catalog/ProductVisual";
import { QuantityInput } from "../components/catalog/QuantityInput";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Button, ButtonLink } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { EmptyState } from "../components/ui/States";
import { useCart } from "../context/CartContext";
import { useSite } from "../context/SiteContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice } from "../lib/format";
import styles from "./CartPage.module.css";

/**
 * Страница корзины.
 *
 * @returns Разметка корзины.
 */
export function CartPage(): ReactNode {
  useDocumentTitle("Корзина");
  const { lines, setQuantity, remove, clear } = useCart();
  const site = useSite();
  const quote = useQuote("pickup");

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "Корзина" }]} />
          <h1 className="h1">Корзина</h1>
        </header>
        {lines.length === 0 ? (
          <EmptyState
            title="В корзине пока пусто"
            text="Выберите лицензии, оборудование или услуги в каталоге — они появятся здесь."
            action={<ButtonLink to="/catalog">Перейти в каталог</ButtonLink>}
          />
        ) : (
          <div className={styles.layout}>
            <div>
              <ul className={styles.lines} aria-label="Товары в корзине">
                {lines.map((line) => (
                  <li key={line.slug} className={styles.line} data-testid="cart-line">
                    <Link to={`/product/${line.slug}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
                      <ProductVisual categorySlug={line.categorySlug} visual={line.visual} title={line.title} />
                    </Link>
                    <div className={styles.lineInfo}>
                      <Link to={`/product/${line.slug}`} className={styles.lineTitle}>
                        {line.title}
                      </Link>
                      {line.sku ? <span className="muted">Арт. {line.sku}</span> : null}
                      <span className={styles.unitPrice}>{formatPrice(line.price)} / шт.</span>
                    </div>
                    <QuantityInput value={line.quantity} onChange={(value) => setQuantity(line.slug, value)} label={`Количество: ${line.title}`} />
                    <span className={styles.lineTotal}>{formatPrice(Number(line.price) * line.quantity)}</span>
                    <button type="button" className={styles.remove} onClick={() => remove(line.slug)} aria-label={`Удалить ${line.title}`}>
                      <Icon name="trash" size={18} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.below}>
                <PromoCodeForm />
                <Button variant="ghost" onClick={clear}>
                  Очистить корзину
                </Button>
              </div>
            </div>
            <OrderSummary quote={quote} delivery="pickup">
              <p className={styles.note}>Курьерская доставка по Москве — {formatPrice(site.delivery_cost)}, выбирается при оформлении.</p>
              <ButtonLink to="/checkout" size="lg" block>
                Оформить заказ
              </ButtonLink>
              <ButtonLink to="/catalog" variant="outline" block>
                Продолжить покупки
              </ButtonLink>
            </OrderSummary>
          </div>
        )}
      </div>
    </div>
  );
}
