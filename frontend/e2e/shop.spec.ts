/**
 * Сквозной сценарий покупки: поиск, карточка, корзина, промокод, оформление, история заказов.
 */
import { expect, test } from "@playwright/test";
import { acceptConsent, open, uniqueSuffix } from "./helpers";

test.describe("Покупка", () => {
  test("гость находит товар, применяет промокод и оформляет заказ с доставкой", async ({ page }) => {
    await open(page, "/catalog");
    await page.getByLabel("Поиск по каталогу").fill("HASP");
    await page.getByRole("button", { name: "Найти" }).click();
    await expect(page).toHaveURL(/q=HASP/);
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await page.getByTestId("product-card").getByRole("link", { name: /HASP-ключ/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: /HASP-ключ/ })).toBeVisible();
    await page.getByRole("button", { name: "Увеличить количество" }).click();
    await page.getByRole("button", { name: "В корзину", exact: true }).click();
    await expect(page.getByText("Добавлено в корзину: 2 шт.")).toBeVisible();
    await expect(page.getByTestId("header-cart-count")).toHaveText("2");

    await page.getByRole("navigation", { name: "Быстрая навигация" }).getByRole("link", { name: "Корзина" }).click();
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
    await expect(page.getByTestId("order-total")).toHaveText(/16\s000\s₽/);
    await page.getByLabel("Код скидки").fill("nope");
    await page.getByRole("button", { name: "Применить" }).click();
    await expect(page.getByText("Промокод не найден или срок его действия истёк.")).toBeVisible();
    await page.getByLabel("Код скидки").fill("sbercity10");
    await page.getByRole("button", { name: "Применить" }).click();
    await expect(page.getByText(/SBERCITY10/)).toBeVisible();
    await expect(page.getByTestId("order-total")).toHaveText(/14\s400\s₽/);

    await page.getByRole("link", { name: "Оформить заказ" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Оформление заказа" })).toBeVisible();
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();
    await expect(page.getByText("Укажите ФИО получателя.")).toBeVisible();

    await page.getByLabel(/ФИО получателя/).fill("Иван Петров");
    await page.getByLabel(/Телефон/).pressSequentially("9161234567");
    await expect(page.getByLabel(/Телефон/)).toHaveValue("+7 (916) 123-45-67");
    await page.getByLabel(/^Email/).fill(`ivan${uniqueSuffix()}@example.com`);
    await page.getByText("Курьером", { exact: true }).click();
    await expect(page.getByTestId("order-total")).toHaveText(/16\s900\s₽/);
    await page.getByLabel(/Адрес доставки/).fill("Москва, ул. Тестовая, д. 1");
    await acceptConsent(page);
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();

    await expect(page.getByRole("heading", { level: 1, name: /Заказ SC-\d{6}-[A-Z0-9]{5} принят/ })).toBeVisible();
    await expect(page.getByText("Курьером: Москва, ул. Тестовая, д. 1")).toBeVisible();
    await expect(page.getByText("Скидка (SBERCITY10)")).toBeVisible();
    await expect(page.getByTestId("header-cart-count")).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: /принят/ })).toBeVisible();
  });

  test("оплата по счёту требует организацию и ИНН", async ({ page }) => {
    await open(page, "/product/yadro-sistemy");
    await page.getByRole("button", { name: "Купить" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await page.getByLabel(/ФИО получателя/).fill("Ольга Смирнова");
    await page.getByLabel(/Телефон/).pressSequentially("9031112233");
    await page.getByLabel(/^Email/).fill(`olga${uniqueSuffix()}@example.com`);
    await page.getByText("По счёту", { exact: true }).click();
    await acceptConsent(page);
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();
    await expect(page.getByText("Для оплаты по счёту укажите организацию.")).toBeVisible();
    await page.getByLabel(/Организация/).fill("ООО «Ромашка»");
    await page.getByLabel(/ИНН/).fill("12345");
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();
    await expect(page.getByText("ИНН должен содержать 10 или 12 цифр.")).toBeVisible();
    await page.getByLabel(/ИНН/).fill("7701234567");
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();
    await expect(page.getByText("Безналичный расчёт по счёту")).toBeVisible();
    await expect(page.getByText(/ООО «Ромашка», ИНН 7701234567/)).toBeVisible();
  });

  test("покупатель регистрируется, заказывает и видит заказ в кабинете", async ({ page }) => {
    const email = `buyer${uniqueSuffix()}@example.com`;
    await open(page, "/account");
    await page.getByRole("tab", { name: "Регистрация" }).click();
    await page.getByLabel(/^Имя/).fill("Анна");
    await page.getByLabel(/^Email/).fill(email);
    await page.getByLabel(/Телефон/).pressSequentially("9160000000");
    await page.getByLabel(/Пароль/).fill("12345678");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();
    await expect(page.getByText(/слишком|распространённый|цифр/i).first()).toBeVisible();
    await page.getByLabel(/Пароль/).fill("Sber-City-2026!");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Здравствуйте, Анна" })).toBeVisible();
    await expect(page.getByText("Заказов пока нет")).toBeVisible();

    await open(page, "/product/ip-kamera");
    await page.getByRole("button", { name: "Купить" }).click();
    await expect(page.getByLabel(/^Email/)).toHaveValue(email);
    await expect(page.getByLabel(/Телефон/)).toHaveValue("+7 (916) 000-00-00");
    await page.getByLabel(/ФИО получателя/).fill("Анна Иванова");
    await acceptConsent(page);
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();
    const heading = page.getByRole("heading", { level: 1, name: /принят/ });
    await expect(heading).toBeVisible();
    const number = ((await heading.textContent()) ?? "").match(/SC-\d{6}-[A-Z0-9]{5}/)?.[0] ?? "";

    await page.getByRole("link", { name: "Мои заказы" }).click();
    await expect(page.getByRole("button", { name: new RegExp(number) })).toBeVisible();
    await page.getByRole("button", { name: new RegExp(number) }).click();
    await expect(page.getByRole("link", { name: /Лицензия на подключение IP-видеокамеры/ }).first()).toBeVisible();

    await page.getByRole("button", { name: "Выйти" }).click();
    await expect(page.getByRole("tab", { name: "Вход" })).toBeVisible();
    await page.getByLabel(/Email/).fill(email);
    await page.getByLabel(/Пароль/).fill("wrong-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await expect(page.getByText("Неверный email или пароль.")).toBeVisible();
    await page.getByLabel(/Пароль/).fill("Sber-City-2026!");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Здравствуйте, Анна" })).toBeVisible();
  });
});
