/**
 * Модульные тесты HTTP-клиента: разбор ошибок, строка запроса, CSRF.
 */
import { describe, expect, it, vi } from "vitest";
import { mockApi } from "../test/utils";
import { ApiError, buildQuery, parseApiError, readCookie, request } from "./client";

describe("parseApiError", () => {
  it("разделяет общие ошибки и ошибки полей", () => {
    const error = parseApiError(400, { non_field_errors: ["Неверный email или пароль."], email: ["Плохой email"] });
    expect(error.message).toBe("Неверный email или пароль.");
    expect(error.fieldErrors).toEqual({ email: ["Плохой email"] });
  });

  it("берёт первое сообщение поля, если общего нет, и разворачивает вложенные ошибки", () => {
    const error = parseApiError(400, { items: { non_field_errors: ["Этот список не может быть пустым."] } });
    expect(error.message).toBe("Этот список не может быть пустым.");
    expect(error.fieldErrors.items).toEqual(["Этот список не может быть пустым."]);
  });

  it("даёт понятное сообщение при 429 и при непонятном теле", () => {
    expect(parseApiError(429, null).message).toContain("Слишком много запросов");
    expect(parseApiError(500, "oops").message).toContain("Не удалось выполнить запрос");
  });
});

describe("buildQuery", () => {
  it("пропускает пустые значения", () => {
    expect(buildQuery({ a: 1, b: "", c: undefined, d: null, e: true })).toBe("?a=1&e=true");
    expect(buildQuery(undefined)).toBe("");
    expect(buildQuery({})).toBe("");
  });
});

describe("request", () => {
  it("для POST получает CSRF-cookie и передаёт токен в заголовке", async () => {
    const { requests } = mockApi({ "POST /api/feedback/subscribe/": { status: 201, body: { email: "a@b.ru" } } });
    const result = await request<{ email: string }>("/feedback/subscribe/", { method: "POST", body: { email: "a@b.ru" } });
    expect(result).toEqual({ email: "a@b.ru" });
    expect(requests.map((item) => `${item.method} ${item.path}`)).toEqual(["GET /api/csrf/", "POST /api/feedback/subscribe/"]);
    expect(requests[1]?.headers["X-CSRFToken"]).toBe("test-token");
    expect(readCookie("csrftoken")).toBe("test-token");
  });

  it("GET не запрашивает CSRF и добавляет параметры", async () => {
    const { requests } = mockApi({ "GET /api/catalog/products/": { body: { count: 0, results: [] } } });
    await request("/catalog/products/", { query: { page_size: 2 } });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.path).toBe("/api/catalog/products/?page_size=2");
  });

  it("выбрасывает ApiError с ошибками полей", async () => {
    mockApi({ "POST /api/orders/": { status: 400, body: { phone: ["Неверный телефон"] } } });
    await expect(request("/orders/", { method: "POST", body: {} })).rejects.toMatchObject({
      status: 400,
      fieldErrors: { phone: ["Неверный телефон"] },
    });
  });

  it("возвращает undefined для 204", async () => {
    mockApi({ "POST /api/auth/logout/": { status: 204 } });
    await expect(request("/auth/logout/", { method: "POST" })).resolves.toBeUndefined();
  });

  it("сообщает о недоступности сети", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await request("/site/").catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });
});
