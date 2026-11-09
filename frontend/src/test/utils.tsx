/**
 * Утилиты тестов: подмена fetch по маршрутам и рендер с провайдерами.
 */
import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import type { Mock } from "vitest";
import type { ProductListItem, SiteInfo } from "../api/types";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { SiteProvider, defaultSiteInfo } from "../context/SiteContext";
import { UiProvider } from "../context/UiContext";

/** Ответ подменённого API. */
export interface MockResponse {
  status?: number;
  body?: unknown;
}

/** Обработчик запроса: получает метод, путь и тело, возвращает ответ. */
export type MockHandler = (request: { method: string; path: string; body: unknown }) => MockResponse | undefined;

/** Записанный запрос к API. */
export interface RecordedRequest {
  method: string;
  path: string;
  body: unknown;
  headers: Record<string, string>;
}

/**
 * Подменяет `fetch`: ответы берутся из словаря «МЕТОД путь» или из обработчика.
 * Неизвестные запросы получают 404, а `/api/auth/me/` по умолчанию — 403.
 *
 * @param routes Словарь ответов по ключу `"GET /api/site/"` (путь без строки запроса допускается).
 * @param fallback Дополнительный обработчик.
 * @returns Mock-функция и журнал запросов.
 */
export function mockApi(routes: Record<string, MockResponse> = {}, fallback?: MockHandler): { fetch: Mock; requests: RecordedRequest[] } {
  const requests: RecordedRequest[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    const body: unknown = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const headers = (init?.headers ?? {}) as Record<string, string>;
    requests.push({ method, path: url, body, headers });
    const pathOnly = url.split("?")[0] ?? url;
    const response =
      routes[`${method} ${url}`] ??
      routes[`${method} ${pathOnly}`] ??
      fallback?.({ method, path: url, body }) ??
      (pathOnly === "/api/auth/me/" ? { status: 403, body: { detail: "Учетные данные не были предоставлены." } } : undefined) ??
      (pathOnly === "/api/csrf/" ? { status: 200, body: { detail: "ok" } } : undefined) ??
      { status: 404, body: { detail: "Не найдено." } };
    if (pathOnly === "/api/csrf/") {
      document.cookie = "csrftoken=test-token; path=/";
    }
    const status = response.status ?? 200;
    return new Response(status === 204 ? null : JSON.stringify(response.body ?? {}), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetch: fetchMock, requests };
}

/** Тестовые сведения о компании. */
export const testSite: SiteInfo = {
  ...defaultSiteInfo,
  phones: ["+7 (495) 000-00-00"],
  sales_email: "sales@test.ru",
  info_email: "info@test.ru",
  address: "Москва, СберСити",
  inn: "7700000000",
};

/** Параметры рендера. */
export interface RenderOptions {
  route?: string;
  path?: string;
}

/**
 * Рендерит элемент внутри роутера и всех провайдеров приложения.
 *
 * @param ui Тестируемый элемент.
 * @param options Начальный адрес и шаблон маршрута.
 * @returns Результат рендера Testing Library.
 */
export function renderWithProviders(ui: ReactNode, options: RenderOptions = {}): RenderResult {
  const { route = "/", path = "*" } = options;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SiteProvider initial={testSite}>
        <AuthProvider>
          <CartProvider>
            <UiProvider>
              <Routes>
                <Route path={path} element={ui} />
                <Route path="/order/:number" element={<p>Страница заказа</p>} />
                <Route path="/cart" element={<p>Страница корзины</p>} />
              </Routes>
            </UiProvider>
          </CartProvider>
        </AuthProvider>
      </SiteProvider>
    </MemoryRouter>,
  );
}

/**
 * Создаёт товар для тестов.
 *
 * @param overrides Поля, которые нужно заменить.
 * @returns Товар каталога.
 */
export function makeProduct(overrides: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: 1,
    title: "HASP-ключ",
    slug: "hasp-klyuch",
    sku: "VS-HASP",
    brand: "VIDEOSAPIENS",
    price: "8000.00",
    old_price: null,
    is_price_on_request: false,
    is_bestseller: false,
    is_new: false,
    in_stock: true,
    image: null,
    visual: "usb-key",
    category: { id: 7, name: "Оборудование", slug: "oborudovanie" },
    ...overrides,
  };
}
