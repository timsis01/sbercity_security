/**
 * Контекст интерфейса: модальное окно заявки «Связаться» и всплывающие уведомления.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CallbackTopic, ProductListItem } from "../api/types";

/** Параметры открытия окна заявки. */
export interface CallbackRequestOptions {
  topic?: CallbackTopic;
  product?: Pick<ProductListItem, "slug" | "title"> | null;
}

/** Всплывающее уведомление. */
export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info" | "error";
}

/** Значение контекста интерфейса. */
export interface UiContextValue {
  callback: CallbackRequestOptions | null;
  openCallback: (options?: CallbackRequestOptions) => void;
  closeCallback: () => void;
  toasts: Toast[];
  notify: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

const TOAST_LIFETIME_MS = 4000;

/**
 * Управляет модальным окном заявки и уведомлениями.
 *
 * @param props Дочерние элементы.
 * @returns Провайдер контекста.
 */
export function UiProvider({ children }: { children: ReactNode }): ReactNode {
  const [callback, setCallback] = useState<CallbackRequestOptions | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef<number>(1);

  const openCallback = useCallback((options: CallbackRequestOptions = {}) => setCallback({ topic: "callback", ...options }), []);
  const closeCallback = useCallback(() => setCallback(null), []);

  const dismissToast = useCallback((id: number) => setToasts((items) => items.filter((toast) => toast.id !== id)), []);

  const notify = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((items) => [...items.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismissToast(id), TOAST_LIFETIME_MS);
    },
    [dismissToast],
  );

  const value = useMemo<UiContextValue>(
    () => ({ callback, openCallback, closeCallback, toasts, notify, dismissToast }),
    [callback, openCallback, closeCallback, toasts, notify, dismissToast],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

/**
 * Возвращает контекст интерфейса.
 *
 * @returns Состояние модального окна, уведомления и действия.
 * @throws Error Если хук вызван вне `UiProvider`.
 */
export function useUi(): UiContextValue {
  const value = useContext(UiContext);
  if (!value) {
    throw new Error("useUi должен использоваться внутри UiProvider");
  }
  return value;
}
