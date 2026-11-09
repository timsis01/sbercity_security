/**
 * Сквозные проверки навигации и страниц на десктопе и мобильном.
 */
import { expect, test } from "@playwright/test";
import { open } from "./helpers";

test.describe("Навигация", () => {
  test("главная показывает первый экран, популярное и новости", async ({ page }) => {
    await open(page, "/");
    await expect(page.getByRole("heading", { level: 1, name: /Безопасность, которая работает незаметно/i })).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(8);
    await page.getByRole("button", { name: "Показать ещё" }).click();
    await expect(page.getByTestId("product-card")).toHaveCount(16);
    await expect(page.getByTestId("news-card")).toHaveCount(3);
    await expect(page).toHaveTitle("СберСити — безопасность");
  });

  test("нижняя панель открывает меню и каталог", async ({ page }) => {
    await open(page, "/");
    const bar = page.getByRole("navigation", { name: "Быстрая навигация" });
    await bar.getByRole("button", { name: "Меню" }).click();
    const menu = page.locator("#site-menu");
    await expect(menu.getByRole("link", { name: "Гарантия" })).toBeVisible();
    await menu.getByRole("link", { name: "Гарантия" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Гарантия" })).toBeVisible();
    await bar.getByRole("link", { name: "Каталог" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Каталог" })).toBeVisible();
  });

  for (const [path, title] of [
    ["/how-to-buy", "Как купить"],
    ["/delivery", "Доставка"],
    ["/warranty", "Гарантия"],
    ["/about", "О компании"],
    ["/contacts", "Контакты"],
    ["/news", "Новости"],
    ["/privacy", "Политика конфиденциальности"],
    ["/account", "Персональный раздел"],
  ] as const) {
    test(`страница ${path} открывается`, async ({ page }) => {
      await open(page, path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    });
  }

  test("новость открывается из ленты", async ({ page }) => {
    await open(page, "/news");
    await page.getByTestId("news-card").first().getByRole("link").click();
    await expect(page.getByRole("link", { name: "Все новости" })).toBeVisible();
    await expect(page.locator(".prose p").first()).toBeVisible();
  });

  test("неизвестный адрес показывает 404, прямой заход на SPA-маршрут работает", async ({ page }) => {
    await open(page, "/no-such-page");
    await expect(page.getByRole("heading", { level: 1, name: "Страница не найдена" })).toBeVisible();
    await open(page, "/product/no-such-product");
    await expect(page.getByText("Товар не найден")).toBeVisible();
  });
});
