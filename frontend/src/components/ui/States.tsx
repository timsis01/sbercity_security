/**
 * Состояния загрузки, ошибки и пустого результата.
 */
import type { ReactNode } from "react";
import { Button } from "./Button";
import styles from "./States.module.css";

/**
 * Индикатор загрузки.
 *
 * @param props Подпись для экранных дикторов.
 * @returns Индикатор.
 */
export function Loader({ label = "Загрузка…" }: { label?: string }): ReactNode {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.bar} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

/** Свойства блока ошибки. */
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Сообщение об ошибке с кнопкой повтора.
 *
 * @param props Текст ошибки и обработчик повтора.
 * @returns Блок ошибки.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps): ReactNode {
  return (
    <div className={styles.state} role="alert">
      <p className={styles.title}>Что-то пошло не так</p>
      <p className={styles.text}>{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      ) : null}
    </div>
  );
}

/** Свойства пустого состояния. */
interface EmptyStateProps {
  title: string;
  text?: string;
  action?: ReactNode;
}

/**
 * Сообщение об отсутствии данных.
 *
 * @param props Заголовок, пояснение и действие.
 * @returns Блок пустого состояния.
 */
export function EmptyState({ title, text, action }: EmptyStateProps): ReactNode {
  return (
    <div className={styles.state}>
      <p className={styles.title}>{title}</p>
      {text ? <p className={styles.text}>{text}</p> : null}
      {action}
    </div>
  );
}
