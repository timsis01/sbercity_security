/**
 * Клиентская валидация полей форм. Повторяет правила бэкенда,
 * чтобы пользователь видел ошибку до отправки; окончательную проверку делает сервер.
 */

/** Функция проверки значения поля: возвращает текст ошибки или `null`. */
export type Validator = (value: string) => string | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INN_RE = /^\d{10}(\d{2})?$/;

/**
 * Извлекает цифры российского номера без кода страны.
 *
 * @param value Телефон в любом формате.
 * @returns Десять цифр номера или `null`, если номер некорректен.
 */
export function phoneDigits(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    digits = digits.slice(1);
  }
  return digits.length === 10 ? digits : null;
}

/**
 * Обязательное поле.
 *
 * @param message Текст ошибки.
 * @returns Валидатор.
 */
export function required(message = "Заполните поле."): Validator {
  return (value) => (value.trim() ? null : message);
}

/**
 * Минимальная длина строки.
 *
 * @param length Минимум символов.
 * @param message Текст ошибки.
 * @returns Валидатор.
 */
export function minLength(length: number, message?: string): Validator {
  return (value) => (value.trim().length >= length ? null : (message ?? `Минимум ${length} символов.`));
}

/** Корректный email. */
export const email: Validator = (value) => (EMAIL_RE.test(value.trim()) ? null : "Введите корректный email.");

/** Российский телефон. */
export const phone: Validator = (value) => (phoneDigits(value) ? null : "Введите телефон в формате +7 (XXX) XXX-XX-XX.");

/** Необязательный российский телефон. */
export const optionalPhone: Validator = (value) => (value.trim() ? phone(value) : null);

/** ИНН из 10 или 12 цифр. */
export const inn: Validator = (value) => (INN_RE.test(value.trim()) ? null : "ИНН должен содержать 10 или 12 цифр.");

/**
 * Последовательно применяет валидаторы и возвращает первую ошибку.
 *
 * @param value Значение поля.
 * @param validators Набор проверок.
 * @returns Текст первой ошибки или `null`.
 */
export function runValidators(value: string, validators: readonly Validator[]): string | null {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return null;
}

/**
 * Форматирует ввод телефона маской «+7 (XXX) XXX-XX-XX» по мере набора.
 *
 * @param value Текущее значение поля.
 * @returns Отформатированная строка.
 */
export function maskPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  if (digits.startsWith("8") || digits.startsWith("7")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  let result = "+7";
  if (parts[0]) {
    result += ` (${parts[0]}`;
  }
  if (parts[0] && parts[0].length === 3) {
    result += ")";
  }
  if (parts[1]) {
    result += ` ${parts[1]}`;
  }
  if (parts[2]) {
    result += `-${parts[2]}`;
  }
  if (parts[3]) {
    result += `-${parts[3]}`;
  }
  return result;
}
