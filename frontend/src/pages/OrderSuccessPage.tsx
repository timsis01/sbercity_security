/**
 * Подтверждение оформленного заказа.
 */
import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../api/endpoints";
import type { Order } from "../api/types";
import { OrderDetails } from "../components/cart/OrderDetails";
import { ButtonLink } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { EmptyState, Loader } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./OrderSuccessPage.module.css";

/**
 * Страница «Заказ принят». Данные берутся из состояния навигации или запрашиваются по номеру.
 *
 * @returns Разметка подтверждения.
 */
export function OrderSuccessPage(): ReactNode {
  const { number = "" } = useParams<{ number: string }>();
  const location = useLocation();
  const stateOrder = (location.state as { order?: Order } | null)?.order;
  const { data, error, loading } = useAsync(() => (stateOrder ? Promise.resolve(stateOrder) : api.order(number)), [number]);
  useDocumentTitle(`Заказ ${number}`);

  if (loading) {
    return (
      <div className="page container page-head">
        <Loader />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="page container page-head">
        <EmptyState title="Заказ не найден" text="Заказ доступен в том браузере, где он оформлен, или в личном кабинете." action={<ButtonLink to="/account">Личный кабинет</ButtonLink>} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <section className={styles.hero} aria-labelledby="order-title">
          <span className={styles.icon}>
            <Icon name="check" size={32} />
          </span>
          <span className="eyebrow">Спасибо за заказ</span>
          <h1 id="order-title" className="h1">
            Заказ {data.number} принят
          </h1>
          <p className="lead">
            Копия заказа отправлена на {data.email}. В ближайшее время менеджер свяжется с вами по телефону, чтобы согласовать сроки и детали доставки.
          </p>
        </section>
        <OrderDetails order={data} />
        <div className={styles.actions}>
          <ButtonLink to="/catalog">Продолжить покупки</ButtonLink>
          <ButtonLink to="/account" variant="outline">
            Мои заказы
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
