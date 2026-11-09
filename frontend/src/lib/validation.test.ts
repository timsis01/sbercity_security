/**
 * Модульные тесты клиентской валидации.
 */
import { describe, expect, it } from "vitest";
import { email, inn, maskPhone, minLength, optionalPhone, phone, phoneDigits, required, runValidators } from "./validation";

describe("валидаторы", () => {
  it("required и minLength", () => {
    expect(required()("  ")).toBe("Заполните поле.");
    expect(required("Укажите имя.")("Анна")).toBeNull();
    expect(minLength(3)("ab")).toBe("Минимум 3 символов.");
    expect(minLength(2)("ab")).toBeNull();
  });

  it("email", () => {
    expect(email("ivan@example.com")).toBeNull();
    expect(email("ivan@example")).not.toBeNull();
    expect(email("ivan example.com")).not.toBeNull();
  });

  it.each([
    ["+7 (916) 123-45-67", "9161234567"],
    ["89161234567", "9161234567"],
    ["9161234567", "9161234567"],
    ["123", null],
    ["+1 202 555 01 00 1", null],
  ])("phoneDigits(%s) → %s", (raw, expected) => {
    expect(phoneDigits(raw)).toBe(expected);
  });

  it("phone и optionalPhone", () => {
    expect(phone("123")).not.toBeNull();
    expect(phone("+7 916 123 45 67")).toBeNull();
    expect(optionalPhone("")).toBeNull();
    expect(optionalPhone("12")).not.toBeNull();
  });

  it("ИНН из 10 или 12 цифр", () => {
    expect(inn("7701234567")).toBeNull();
    expect(inn("770123456789")).toBeNull();
    expect(inn("77012345")).not.toBeNull();
  });

  it("runValidators возвращает первую ошибку", () => {
    expect(runValidators("", [required("A"), minLength(5, "B")])).toBe("A");
    expect(runValidators("abc", [required("A"), minLength(5, "B")])).toBe("B");
    expect(runValidators("abcdef", [required("A"), minLength(5, "B")])).toBeNull();
  });
});

describe("maskPhone", () => {
  it.each([
    ["", ""],
    ["9", "+7 (9"],
    ["916", "+7 (916)"],
    ["9161", "+7 (916) 1"],
    ["8916123456789", "+7 (916) 123-45-67"],
    ["+7 (916) 123-45-67", "+7 (916) 123-45-67"],
  ])("%s → %s", (input, expected) => {
    expect(maskPhone(input)).toBe(expected);
  });
});
