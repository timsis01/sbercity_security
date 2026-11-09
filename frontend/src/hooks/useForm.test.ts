/**
 * Модульные тесты проверки форм.
 */
import { describe, expect, it } from "vitest";
import { email, required } from "../lib/validation";
import { checkoutRules } from "../pages/CheckoutPage";
import { validateValues } from "./useForm";

describe("validateValues", () => {
  it("возвращает ошибки по полям и требует согласие", () => {
    const errors = validateValues({ name: "", email: "bad", consent: false }, { name: [required("Имя")], email: [email] }, "consent");
    expect(errors).toEqual({ name: "Имя", email: "Введите корректный email.", consent: "Необходимо согласие на обработку персональных данных." });
  });

  it("не возвращает ошибок для корректных данных", () => {
    expect(validateValues({ name: "Анна", consent: true }, { name: [required()] }, "consent")).toEqual({});
  });
});

describe("checkoutRules", () => {
  const base = {
    customer_name: "Иван",
    phone: "+7 (916) 123-45-67",
    email: "ivan@example.com",
    company: "",
    inn: "",
    delivery_method: "pickup",
    address: "",
    payment_method: "cash",
    comment: "",
    consent: true,
  };

  it("для самовывоза и наличных не требует адрес и реквизиты", () => {
    expect(validateValues(base, checkoutRules(base), "consent")).toEqual({});
  });

  it("для курьера требует адрес, для счёта — организацию и ИНН", () => {
    const values = { ...base, delivery_method: "courier", payment_method: "invoice", inn: "123" };
    expect(Object.keys(validateValues(values, checkoutRules(values), "consent")).sort()).toEqual(["address", "company", "inn"]);
  });
});
