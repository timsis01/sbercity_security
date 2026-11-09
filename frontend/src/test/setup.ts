/**
 * Подготовка окружения модульных тестов: матчеры jest-dom, очистка DOM и хранилища.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
