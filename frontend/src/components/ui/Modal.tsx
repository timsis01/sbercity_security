/**
 * Модальное окно на нативном элементе `dialog`: фокус, Escape и затемнение фона.
 */
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Modal.module.css";

/** Свойства модального окна. */
interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Модальное окно с заголовком и кнопкой закрытия.
 *
 * @param props Флаг открытия, заголовок, обработчик закрытия и содержимое.
 * @returns Элемент `dialog`.
 */
export function Modal({ open, title, onClose, children }: ModalProps): ReactNode {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) {
          onClose();
        }
      }}
    >
      {open ? (
        <div className={styles.body}>
          <div className={styles.head}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
              <Icon name="close" size={22} />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
