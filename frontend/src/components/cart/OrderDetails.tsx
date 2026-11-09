/**
 * Подробности оформленного заказа: позиции, суммы, доставка и оплата.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../api/types";
import { formatDate, formatPhone, formatPrice } from "../../lib/format";
import styles from "./OrderDetails.module.css";

/**
 * Отрисовывает состав и параметры заказа.
 *
 * @param props Заказ.
 * @returns Блок с таблицей позиций и реквизитами.
 */
export function OrderDetails({ order }: { order: Order }): ReactNode {
  return (
    <div className={styles.details}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">Состав заказа {order.number}</caption>
          <thead>
            <tr>
              <th scope="col">Товар</th>
              <th scope="col">Цена</th>
              <th scope="col">Кол-во</th>
              <th scope="col">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_slug ? <Link to={`/product/${item.product_slug}`}>{item.title}</Link> : item.title}</td>
                <td>{formatPrice(item.price)}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3}>
                Товары
              </th>
              <td>{formatPrice(order.subtotal)}</td>
            </tr>
            {Number(order.discount) > 0 ? (
              <tr>
                <th scope="row" colSpan={3}>
                  Скидка {order.promo_code ? `(${order.promo_code})` : ""}
                </th>
                <td>−{formatPrice(order.discount)}</td>
              </tr>
            ) : null}
            <tr>
              <th scope="row" colSpan={3}>
                Доставка
              </th>
              <td>{Number(order.delivery_cost) > 0 ? formatPrice(order.delivery_cost) : "Бесплатно"}</td>
            </tr>
            <tr className={styles.total}>
              <th scope="row" colSpan={3}>
                Итого
              </th>
              <td>{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>Статус</dt>
          <dd>{order.status_display}</dd>
        </div>
        <div>
          <dt>Дата</dt>
          <dd>{formatDate(order.created_at)}</dd>
        </div>
        <div>
          <dt>Получатель</dt>
          <dd>
            {order.customer_name}, {formatPhone(order.phone)}
          </dd>
        </div>
        <div>
          <dt>Получение</dt>
          <dd>
            {order.delivery_method_display}
            {order.address ? `: ${order.address}` : ""}
          </dd>
        </div>
        <div>
          <dt>Оплата</dt>
          <dd>{order.payment_method_display}</dd>
        </div>
        {order.company ? (
          <div>
            <dt>Организация</dt>
            <dd>
              {order.company}
              {order.inn ? `, ИНН ${order.inn}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
