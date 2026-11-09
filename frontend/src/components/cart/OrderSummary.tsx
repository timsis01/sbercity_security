/**
 * Итоги корзины, рассчитанные сервером по актуальным ценам, скидке и доставке.
 */
import type { ReactNode } from "react";
import { api } from "../../api/endpoints";
import type { DeliveryMethod, Quote } from "../../api/types";
import { useCart } from "../../context/CartContext";
import { useAsync } from "../../hooks/useAsync";
import type { AsyncState } from "../../hooks/useAsync";
import { toPayload } from "../../lib/cart";
import { formatPrice } from "../../lib/format";
import { FormMessage } from "../ui/Field";
import styles from "./OrderSummary.module.css";

/**
 * Запрашивает расчёт корзины у сервера при каждом изменении позиций, доставки или промокода.
 *
 * @param delivery Способ доставки.
 * @returns Состояние расчёта.
 */
export function useQuote(delivery: DeliveryMethod): AsyncState<Quote | null> {
  const { lines, promoCode } = useCart();
  const payload = toPayload(lines);
  const key = JSON.stringify({ payload, delivery, promoCode });
  return useAsync(
    () => (payload.length === 0 ? Promise.resolve(null) : api.quote({ items: payload, delivery_method: delivery, promo_code: promoCode || undefined })),
    [key],
  );
}

/** Свойства блока итогов. */
interface OrderSummaryProps {
  quote: AsyncState<Quote | null>;
  delivery: DeliveryMethod;
  children?: ReactNode;
}

/**
 * Отрисовывает суммы заказа.
 *
 * @param props Состояние расчёта, способ доставки и дополнительные элементы (кнопки).
 * @returns Блок итогов.
 */
export function OrderSummary({ quote, delivery, children }: OrderSummaryProps): ReactNode {
  const { subtotal, count } = useCart();
  const data = quote.data;
  return (
    <aside className={styles.summary} aria-label="Итоги заказа" aria-busy={quote.loading}>
      <h2 className={styles.title}>Ваш заказ</h2>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Товары ({count} шт.)</dt>
          <dd>{formatPrice(data?.subtotal ?? subtotal)}</dd>
        </div>
        {data && Number(data.discount) > 0 ? (
          <div className={`${styles.row} ${styles.discount}`}>
            <dt>Скидка по промокоду ({data.discount_percent}%)</dt>
            <dd>−{formatPrice(data.discount)}</dd>
          </div>
        ) : null}
        <div className={styles.row}>
          <dt>{delivery === "courier" ? "Доставка курьером" : "Самовывоз"}</dt>
          <dd>{data ? (Number(data.delivery_cost) > 0 ? formatPrice(data.delivery_cost) : "Бесплатно") : "—"}</dd>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Итого</dt>
          <dd data-testid="order-total">{formatPrice(data?.total ?? subtotal)}</dd>
        </div>
      </dl>
      {quote.error ? <FormMessage tone="error">{quote.error.message}</FormMessage> : null}
      {children}
    </aside>
  );
}
