/**
 * Форматирование цен, дат, телефонов и склонений для русского языка.
 */

const NBSP = " ";
const priceFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/**
 * Форматирует сумму в рублях с неразрывными пробелами между разрядами.
 *
 * @param value Сумма числом или строкой из API; `null` — цена по запросу.
 * @returns Строка вида «13 977,6 ₽» или «Цена по запросу».
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Цена по запросу";
  }
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "Цена по запросу";
  }
  return `${priceFormatter.format(amount).replace(/\s/g, NBSP)}${NBSP}₽`;
}

/**
 * Форматирует дату ISO как «ДД.ММ.ГГГГ».
 *
 * @param iso Дата в формате ISO 8601.
 * @returns Дата в коротком формате.
 */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/**
 * Форматирует дату ISO как «5 ноября 2026 г.».
 *
 * @param iso Дата в формате ISO 8601.
 * @returns Дата в длинном формате.
 */
export function formatLongDate(iso: string): string {
  return longDateFormatter.format(new Date(iso));
}

/**
 * Выбирает форму слова для числительного.
 *
 * @param count Число.
 * @param forms Формы для 1, 2–4 и 5+ (например, «товар», «товара», «товаров»).
 * @returns Подходящая форма.
 */
export function pluralize(count: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) {
    return forms[2];
  }
  if (last > 1 && last < 5) {
    return forms[1];
  }
  if (last === 1) {
    return forms[0];
  }
  return forms[2];
}

/**
 * Превращает телефон в ссылку `tel:`.
 *
 * @param phone Телефон в любом формате.
 * @returns Ссылка вида `tel:+74950000000`.
 */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

/**
 * Форматирует нормализованный телефон `+7XXXXXXXXXX` для отображения.
 *
 * @param phone Телефон из API.
 * @returns Строка вида «+7 (916) 123-45-67» или исходное значение.
 */
export function formatPhone(phone: string): string {
  const match = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  if (!match) {
    return phone;
  }
  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}
