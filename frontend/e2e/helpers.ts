/**
 * Общие шаги сквозных тестов.
 */
import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/**
 * Возвращает уникальный суффикс для email и имён, чтобы тесты не конфликтовали между запусками.
 *
 * @returns Строка из времени и случайного числа.
 */
export function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * Отмечает чекбокс согласия на обработку персональных данных внутри формы.
 *
 * @param scope Форма или диалог.
 */
export async function acceptConsent(scope: Locator | Page): Promise<void> {
  await scope.getByRole("checkbox", { name: /Я соглашаюсь на обработку персональных данных/ }).check();
}

/**
 * Открывает страницу и дожидается загрузки шрифтов и данных.
 *
 * @param page Страница Playwright.
 * @param path Адрес относительно baseURL.
 */
export async function open(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator("main")).toBeVisible();
}
