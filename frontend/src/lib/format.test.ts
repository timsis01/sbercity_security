/**
 * Модульные тесты форматирования.
 */
import { describe, expect, it } from "vitest";
import { formatDate, formatPhone, formatPrice, phoneHref, pluralize } from "./format";

describe("formatPrice", () => {
  it("форматирует рубли с неразрывными пробелами", () => {
    expect(formatPrice("1999999.00")).toBe("1 999 999 ₽");
    expect(formatPrice(288)).toBe("288 ₽");
  });

  it("сохраняет копейки", () => {
    expect(formatPrice("13977.60")).toBe("13 977,6 ₽");
  });

  it("показывает «Цена по запросу» для пустых значений", () => {
    expect(formatPrice(null)).toBe("Цена по запросу");
    expect(formatPrice("")).toBe("Цена по запросу");
    expect(formatPrice("abc")).toBe("Цена по запросу");
  });
});

describe("pluralize", () => {
  const forms = ["товар", "товара", "товаров"] as const;
  it.each([
    [1, "товар"],
    [2, "товара"],
    [4, "товара"],
    [5, "товаров"],
    [11, "товаров"],
    [14, "товаров"],
    [21, "товар"],
    [22, "товара"],
    [41, "товар"],
    [111, "товаров"],
    [0, "товаров"],
  ])("%i → %s", (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected);
  });
});

describe("телефоны и даты", () => {
  it("строит ссылку tel:", () => {
    expect(phoneHref("+7 (495) 000-00-00")).toBe("tel:+74950000000");
  });

  it("форматирует нормализованный телефон", () => {
    expect(formatPhone("+79161234567")).toBe("+7 (916) 123-45-67");
    expect(formatPhone("123")).toBe("123");
  });

  it("форматирует дату как ДД.ММ.ГГГГ", () => {
    expect(formatDate("2026-11-05T10:00:00+03:00")).toBe("05.11.2026");
  });
});
