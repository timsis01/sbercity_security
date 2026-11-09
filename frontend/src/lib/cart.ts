/**
 * Чистая логика корзины: редьюсер, подсчёт количества и суммы, сериализация.
 */
import type { CartItemPayload, ProductListItem } from "../api/types";

/** Максимальное количество одной позиции, как на бэкенде. */
export const MAX_QUANTITY = 999;

/** Позиция корзины, хранящаяся в браузере. */
export interface CartLine {
  slug: string;
  title: string;
  sku: string;
  price: string;
  categorySlug: string;
  visual: string;
  quantity: number;
}

/** Состояние корзины. */
export interface CartState {
  lines: CartLine[];
  promoCode: string;
}

/** Действия над корзиной. */
export type CartAction =
  | { type: "add"; product: ProductListItem; quantity: number }
  | { type: "setQuantity"; slug: string; quantity: number }
  | { type: "remove"; slug: string }
  | { type: "setPromo"; code: string }
  | { type: "replace"; state: CartState }
  | { type: "clear" };

/** Пустая корзина. */
export const emptyCart: CartState = { lines: [], promoCode: "" };

/**
 * Ограничивает количество допустимым диапазоном.
 *
 * @param quantity Желаемое количество.
 * @returns Целое число от 1 до `MAX_QUANTITY`.
 */
export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

/**
 * Применяет действие к состоянию корзины.
 * Товары без цены («по запросу») в корзину не добавляются.
 *
 * @param state Текущее состояние.
 * @param action Действие.
 * @returns Новое состояние.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const { product } = action;
      if (product.price === null) {
        return state;
      }
      const existing = state.lines.find((line) => line.slug === product.slug);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.slug === product.slug ? { ...line, quantity: clampQuantity(line.quantity + action.quantity), price: product.price ?? line.price } : line,
          ),
        };
      }
      const line: CartLine = {
        slug: product.slug,
        title: product.title,
        sku: product.sku,
        price: product.price,
        categorySlug: product.category.slug,
        visual: product.visual,
        quantity: clampQuantity(action.quantity),
      };
      return { ...state, lines: [...state.lines, line] };
    }
    case "setQuantity":
      return {
        ...state,
        lines: state.lines.map((line) => (line.slug === action.slug ? { ...line, quantity: clampQuantity(action.quantity) } : line)),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((line) => line.slug !== action.slug) };
    case "setPromo":
      return { ...state, promoCode: action.code.trim().toUpperCase() };
    case "replace":
      return action.state;
    case "clear":
      return emptyCart;
  }
}

/**
 * Считает общее количество единиц товара.
 *
 * @param lines Позиции корзины.
 * @returns Сумма количеств.
 */
export function cartCount(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/**
 * Считает предварительную сумму по ценам, сохранённым в браузере.
 * Окончательную сумму всегда рассчитывает сервер.
 *
 * @param lines Позиции корзины.
 * @returns Сумма в рублях, округлённая до копеек.
 */
export function cartSubtotal(lines: readonly CartLine[]): number {
  const kopecks = lines.reduce((total, line) => total + Math.round(Number(line.price) * 100) * line.quantity, 0);
  return kopecks / 100;
}

/**
 * Готовит позиции корзины для запроса к API.
 *
 * @param lines Позиции корзины.
 * @returns Пары «слаг — количество».
 */
export function toPayload(lines: readonly CartLine[]): CartItemPayload[] {
  return lines.map((line) => ({ product: line.slug, quantity: line.quantity }));
}

/**
 * Проверяет и восстанавливает корзину из сохранённого JSON.
 *
 * @param raw Строка из хранилища.
 * @returns Корректное состояние или пустая корзина.
 */
export function parseStoredCart(raw: string | null): CartState {
  if (!raw) {
    return emptyCart;
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (data === null || typeof data !== "object") {
      return emptyCart;
    }
    const record = data as Partial<CartState>;
    const lines = Array.isArray(record.lines)
      ? record.lines.filter(
          (line): line is CartLine =>
            typeof line === "object" &&
            line !== null &&
            typeof line.slug === "string" &&
            typeof line.title === "string" &&
            typeof line.price === "string" &&
            typeof line.quantity === "number",
        )
      : [];
    return {
      lines: lines.map((line) => ({ ...line, sku: line.sku ?? "", categorySlug: line.categorySlug ?? "", visual: line.visual ?? "", quantity: clampQuantity(line.quantity) })),
      promoCode: typeof record.promoCode === "string" ? record.promoCode : "",
    };
  } catch {
    return emptyCart;
  }
}
