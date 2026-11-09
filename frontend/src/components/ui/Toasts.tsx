/**
 * Всплывающие уведомления над нижней панелью.
 */
import type { ReactNode } from "react";
import { useUi } from "../../context/UiContext";
import { Icon } from "./Icon";
import styles from "./Toasts.module.css";

/**
 * Отрисовывает активные уведомления.
 *
 * @returns Область уведомлений с `aria-live`.
 */
export function Toasts(): ReactNode {
  const { toasts, dismissToast } = useUi();
  return (
    <div className={styles.region} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.tone]}`} role="status">
          <Icon name={toast.tone === "error" ? "close" : "check"} size={18} />
          <span className={styles.text}>{toast.message}</span>
          <button type="button" className={styles.close} onClick={() => dismissToast(toast.id)} aria-label="Скрыть уведомление">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
