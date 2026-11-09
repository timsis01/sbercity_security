/**
 * Сквозные проверки форм обратной связи на реальном бэкенде.
 */
import { expect, test } from "@playwright/test";
import { acceptConsent, open, uniqueSuffix } from "./helpers";

test.describe("Формы", () => {
  test("запрос цены по товару без цены", async ({ page }) => {
    await open(page, "/catalog/ognetushiteli");
    const card = page.getByTestId("product-card").filter({ hasText: "РАФ-100П" });
    await expect(card.getByText("Цена по запросу")).toBeVisible();
    await card.getByRole("button", { name: "Запросить цену" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Запросить цену" })).toBeVisible();
    await expect(dialog.getByText("Огнетушитель РАФ-100П")).toBeVisible();
    await dialog.getByRole("button", { name: "Отправить заявку" }).click();
    await expect(dialog.getByText("Укажите имя.")).toBeVisible();
    await dialog.getByLabel(/Имя/).fill("Пётр");
    await dialog.getByLabel(/Телефон/).pressSequentially("9160001122");
    await acceptConsent(dialog);
    await dialog.getByRole("button", { name: "Отправить заявку" }).click();
    await expect(dialog.getByText(/Заявка принята/)).toBeVisible();
    await dialog.getByRole("button", { name: "Закрыть" }).click();
    await expect(dialog).toBeHidden();
  });

  test("кнопка «Связаться» на нижней панели", async ({ page }) => {
    await open(page, "/");
    await page.getByRole("navigation", { name: "Быстрая навигация" }).getByRole("button", { name: "Связаться" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Обратный звонок" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("форма консультации на главной", async ({ page }) => {
    await open(page, "/");
    const form = page.getByRole("form", { name: "Форма заявки" }).last();
    await form.getByLabel(/Имя/).fill("Мария");
    await form.getByLabel(/Телефон/).pressSequentially("9998887766");
    await form.getByLabel("Комментарий").fill("Нужна система видеоаналитики для сети из 5 магазинов");
    await acceptConsent(form);
    await form.getByRole("button", { name: "Получить консультацию" }).click();
    await expect(page.getByText(/Заявка принята/)).toBeVisible();
  });

  test("подписка на скидки", async ({ page }) => {
    await open(page, "/");
    const form = page.getByRole("form", { name: "Подписка на скидки" });
    await form.getByLabel("Email для скидок").fill("not-an-email");
    await form.getByRole("button", { name: "Подписаться" }).click();
    await expect(form.getByText("Введите корректный email.")).toBeVisible();
    await form.getByLabel("Email для скидок").fill(`sub${uniqueSuffix()}@example.com`);
    await form.getByRole("button", { name: "Подписаться" }).click();
    await expect(page.getByText(/Будем присылать новости/)).toBeVisible();
  });

  test("сообщение со страницы контактов", async ({ page }) => {
    await open(page, "/contacts");
    const form = page.getByRole("form", { name: "Форма обратной связи" });
    await form.getByRole("button", { name: "Отправить сообщение" }).click();
    await expect(form.getByText("Укажите имя.")).toBeVisible();
    await expect(form.getByText("Укажите email.")).toBeVisible();
    await form.getByLabel(/Имя/).fill("Иван");
    await form.getByLabel(/Email/).fill("ivan@example.com");
    await form.getByLabel(/Телефон/).pressSequentially("123");
    await form.getByLabel(/Сообщение/).fill("Спасибо за быструю доставку и помощь с настройкой!");
    await acceptConsent(form);
    await form.getByRole("button", { name: "Отправить сообщение" }).click();
    await expect(form.getByText("Введите телефон в формате +7 (XXX) XXX-XX-XX.")).toBeVisible();
    await form.getByLabel(/Телефон/).fill("");
    await form.getByRole("button", { name: "Отправить сообщение" }).click();
    await expect(page.getByText(/Сообщение отправлено/)).toBeVisible();
  });

  test("отзыв уходит на модерацию", async ({ page }) => {
    await open(page, "/about");
    await expect(page.getByText(/из 5 на основе/)).toBeVisible();
    const form = page.getByRole("form", { name: "Форма отзыва" });
    await form.getByLabel(/Ваше имя/).fill("Анна");
    await form.getByLabel("4 из 5").check({ force: true });
    await form.getByLabel(/Отзыв/).fill("Удобный магазин, быстро привезли лицензии.");
    await form.getByRole("button", { name: "Оставить отзыв" }).click();
    await expect(page.getByText(/после проверки модератором/)).toBeVisible();
  });
});
