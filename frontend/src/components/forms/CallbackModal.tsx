/**
 * Глобальное модальное окно заявки, открываемое кнопкой «Связаться» и «Запросить цену».
 */
import type { ReactNode } from "react";
import type { CallbackTopic } from "../../api/types";
import { useUi } from "../../context/UiContext";
import { Modal } from "../ui/Modal";
import { CallbackForm } from "./CallbackForm";

const titles: Record<CallbackTopic, string> = {
  callback: "Обратный звонок",
  price: "Запросить цену",
  quick_order: "Быстрый заказ",
  consultation: "Консультация",
};

/**
 * Отрисовывает окно заявки по состоянию контекста интерфейса.
 *
 * @returns Модальное окно.
 */
export function CallbackModal(): ReactNode {
  const { callback, closeCallback } = useUi();
  const topic: CallbackTopic = callback?.topic ?? "callback";
  return (
    <Modal open={callback !== null} title={titles[topic]} onClose={closeCallback}>
      {callback?.product ? (
        <p className="muted" style={{ marginBottom: 20 }}>
          Товар: <strong>{callback.product.title}</strong>
        </p>
      ) : (
        <p className="muted" style={{ marginBottom: 20 }}>
          Оставьте телефон — менеджер перезвонит, ответит на вопросы и поможет подобрать решение.
        </p>
      )}
      <CallbackForm key={`${topic}-${callback?.product?.slug ?? "none"}`} topic={topic} productSlug={callback?.product?.slug ?? null} />
    </Modal>
  );
}
