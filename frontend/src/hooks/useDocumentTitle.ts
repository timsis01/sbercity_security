/**
 * Хук установки заголовка вкладки браузера.
 */
import { useEffect } from "react";

const SUFFIX = "СберСити — безопасность";

/**
 * Устанавливает заголовок документа вида «Страница — СберСити — безопасность».
 *
 * @param title Название страницы; пустое значение оставляет только название компании.
 */
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : SUFFIX;
  }, [title]);
}
