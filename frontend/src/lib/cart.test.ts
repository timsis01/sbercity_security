/**
 * Модульные тесты логики корзины.
 */
import { describe, expect, it } from "vitest";
import { makeProduct } from "../test/utils";
import { MAX_QUANTITY, cartCount, cartReducer, cartSubtotal, clampQuantity, emptyCart, parseStoredCart, toPayload } from "./cart";
import type { CartState } from "./cart";

describe("cartReducer", () => {
  it("добавляет товар и увеличивает количество при повторном добавлении", () => {
    const product = makeProduct();
    let state = cartReducer(emptyCart, { type: "add", product, quantity: 1 });
    state = cartReducer(state, { type: "add", product, quantity: 2 });
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]).toMatchObject({ slug: "hasp-klyuch", quantity: 3, price: "8000.00", categorySlug: "oborudovanie", visual: "usb-key" });
  });

  it("не добавляет товар с ценой по запросу", () => {
    const state = cartReducer(emptyCart, { type: "add", product: makeProduct({ price: null, is_price_on_request: true }), quantity: 1 });
    expect(state).toBe(emptyCart);
  });

  it("меняет количество в допустимых пределах и удаляет позицию", () => {
    let state = cartReducer(emptyCart, { type: "add", product: makeProduct(), quantity: 1 });
    state = cartReducer(state, { type: "setQuantity", slug: "hasp-klyuch", quantity: 5000 });
    expect(state.lines[0]?.quantity).toBe(MAX_QUANTITY);
    state = cartReducer(state, { type: "setQuantity", slug: "hasp-klyuch", quantity: -3 });
    expect(state.lines[0]?.quantity).toBe(1);
    state = cartReducer(state, { type: "remove", slug: "hasp-klyuch" });
    expect(state.lines).toEqual([]);
  });

  it("нормализует промокод и очищает корзину", () => {
    let state = cartReducer(emptyCart, { type: "setPromo", code: "  sbercity10 " });
    expect(state.promoCode).toBe("SBERCITY10");
    state = cartReducer(state, { type: "clear" });
    expect(state).toEqual(emptyCart);
  });

  it("заменяет состояние целиком", () => {
    const next: CartState = { lines: [], promoCode: "X" };
    expect(cartReducer(emptyCart, { type: "replace", state: next })).toBe(next);
  });
});

describe("итоги корзины", () => {
  const lines = [
    { slug: "a", title: "A", sku: "", price: "13977.60", categorySlug: "", visual: "", quantity: 3 },
    { slug: "b", title: "B", sku: "", price: "0.10", categorySlug: "", visual: "", quantity: 3 },
  ];

  it("считает количество и сумму без ошибок округления", () => {
    expect(cartCount(lines)).toBe(6);
    expect(cartSubtotal(lines)).toBe(41933.1);
  });

  it("готовит данные для API", () => {
    expect(toPayload(lines)).toEqual([
      { product: "a", quantity: 3 },
      { product: "b", quantity: 3 },
    ]);
  });

  it("ограничивает количество", () => {
    expect(clampQuantity(Number.NaN)).toBe(1);
    expect(clampQuantity(2.7)).toBe(2);
  });
});

describe("parseStoredCart", () => {
  it("восстанавливает корректную корзину", () => {
    const raw = JSON.stringify({ lines: [{ slug: "a", title: "A", price: "1.00", quantity: 2 }], promoCode: "P" });
    expect(parseStoredCart(raw)).toEqual({
      lines: [{ slug: "a", title: "A", price: "1.00", quantity: 2, sku: "", categorySlug: "", visual: "" }],
      promoCode: "P",
    });
  });

  it("отбрасывает повреждённые данные", () => {
    expect(parseStoredCart(null)).toEqual(emptyCart);
    expect(parseStoredCart("{oops")).toEqual(emptyCart);
    expect(parseStoredCart("42")).toEqual(emptyCart);
    expect(parseStoredCart(JSON.stringify({ lines: [{ slug: 1 }], promoCode: 5 }))).toEqual(emptyCart);
  });
});
