/**
 * HTTP-клиент API: JSON, сессионные cookie и CSRF-защита Django.
 */

/** Ошибки полей в формате DRF: имя поля → список сообщений. */
export type FieldErrors = Record<string, string[]>;

/** Метод HTTP-запроса. */
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

const API_PREFIX = "/api";
const CSRF_COOKIE = "csrftoken";
const UNSAFE_METHODS: ReadonlySet<HttpMethod> = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * Ошибка ответа API с разобранными сообщениями.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  /**
   * Создаёт ошибку API.
   *
   * @param status HTTP-статус ответа (0 — сеть недоступна).
   * @param message Общее сообщение для пользователя.
   * @param fieldErrors Ошибки отдельных полей формы.
   */
  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Приводит значение ошибки DRF к списку строк.
 *
 * @param value Значение из тела ответа.
 * @returns Плоский список сообщений.
 */
function flattenMessages(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenMessages);
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(flattenMessages);
  }
  return [];
}

/**
 * Разбирает тело ошибки DRF на общее сообщение и ошибки полей.
 *
 * @param status HTTP-статус.
 * @param body Распарсенное тело ответа.
 * @returns Ошибка API.
 */
export function parseApiError(status: number, body: unknown): ApiError {
  const fallback = status === 429 ? "Слишком много запросов. Попробуйте через несколько минут." : "Не удалось выполнить запрос. Попробуйте ещё раз.";
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return new ApiError(status, fallback);
  }
  const record = body as Record<string, unknown>;
  const fieldErrors: FieldErrors = {};
  const general: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    const messages = flattenMessages(value);
    if (key === "detail" || key === "non_field_errors") {
      general.push(...messages);
    } else if (messages.length > 0) {
      fieldErrors[key] = messages;
    }
  }
  const message = general[0] ?? Object.values(fieldErrors)[0]?.[0] ?? fallback;
  return new ApiError(status, message, fieldErrors);
}

/**
 * Читает значение cookie по имени.
 *
 * @param name Имя cookie.
 * @returns Значение или `null`.
 */
export function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

let csrfRequest: Promise<void> | null = null;

/**
 * Гарантирует наличие CSRF-cookie, запрашивая её у бэкенда один раз.
 *
 * @returns Промис, завершающийся после установки cookie.
 */
async function ensureCsrfCookie(): Promise<void> {
  if (readCookie(CSRF_COOKIE)) {
    return;
  }
  csrfRequest ??= fetch(`${API_PREFIX}/csrf/`, { credentials: "same-origin" })
    .then(() => undefined)
    .finally(() => {
      csrfRequest = null;
    });
  await csrfRequest;
}

/** Параметры запроса к API. */
export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

/**
 * Собирает строку запроса, пропуская пустые параметры.
 *
 * @param query Параметры.
 * @returns Строка вида `?a=1&b=2` или пустая строка.
 */
export function buildQuery(query: RequestOptions["query"]): string {
  if (!query) {
    return "";
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * Выполняет запрос к API и возвращает распарсенный JSON.
 *
 * @param path Путь относительно `/api`, например `/catalog/products/`.
 * @param options Метод, тело, параметры и сигнал отмены.
 * @returns Тело ответа; для `204` — `undefined`.
 * @throws ApiError При сетевой ошибке или статусе вне 2xx.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (UNSAFE_METHODS.has(method)) {
    await ensureCsrfCookie();
    headers["X-CSRFToken"] = readCookie(CSRF_COOKIE) ?? "";
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}${buildQuery(options.query)}`, {
      method,
      headers,
      credentials: "same-origin",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, "Нет соединения с сервером. Проверьте интернет и попробуйте снова.");
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!response.ok) {
    throw parseApiError(response.status, body);
  }
  return body as T;
}
