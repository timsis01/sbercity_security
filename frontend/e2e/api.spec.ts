/**
 * Сквозные проверки контрактов API на запущенном стенде.
 */
import { expect, test } from "@playwright/test";

test.describe("API", () => {
  test("служебные эндпоинты отвечают", async ({ request }) => {
    const health = await request.get("/api/health/");
    expect(health.status()).toBe(200);
    expect(await health.json()).toMatchObject({ status: "ok" });
    const site = await request.get("/api/site/");
    expect((await site.json()).company_name).toBe("СберСити — безопасность");
    expect((await request.get("/api/schema/")).status()).toBe(200);
  });

  test("каталог, фильтры и новости", async ({ request }) => {
    const categories = await (await request.get("/api/catalog/categories/")).json();
    expect(categories.length).toBeGreaterThanOrEqual(6);
    const all = await (await request.get("/api/catalog/products/?page_size=1")).json();
    expect(all.count).toBe(41);
    const videosapiens = await (await request.get("/api/catalog/products/?category=videosapiens")).json();
    expect(videosapiens.count).toBe(24);
    const search = await (await request.get("/api/catalog/products/?search=HASP")).json();
    expect(search.results[0].slug).toBe("hasp-klyuch");
    const product = await (await request.get("/api/catalog/products/hasp-klyuch/")).json();
    expect(product.price).toBe("8000.00");
    expect((await request.get("/api/catalog/products/missing/")).status()).toBe(404);
    const news = await (await request.get("/api/news/")).json();
    expect(news.count).toBe(8);
  });

  test("небезопасные запросы без CSRF-токена отклоняются", async ({ request }) => {
    const response = await request.post("/api/feedback/subscribe/", { data: { email: "csrf@example.com" } });
    expect(response.status()).toBe(403);
    expect((await response.json()).detail).toContain("CSRF");
  });

  test("гость не видит список заказов", async ({ request }) => {
    expect((await request.get("/api/orders/")).status()).toBe(403);
    expect((await request.get("/api/auth/me/")).status()).toBe(403);
  });

  test("админка доступна по /admin/", async ({ request }) => {
    const response = await request.get("/admin/login/");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("СберСити — безопасность");
  });
});
