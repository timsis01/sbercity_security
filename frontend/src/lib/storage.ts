/**
 * Безопасная работа с localStorage: в приватном режиме доступ может быть запрещён.
 */

/**
 * Читает строку из localStorage.
 *
 * @param key Ключ.
 * @returns Значение или `null`, если хранилище недоступно.
 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Записывает строку в localStorage, игнорируя ошибки доступа.
 *
 * @param key Ключ.
 * @param value Значение.
 */
export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}
