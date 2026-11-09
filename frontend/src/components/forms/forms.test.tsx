/**
 * Интеграционные тесты форм: клиентская валидация, отправка и ошибки сервера.
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { mockApi, renderWithProviders } from "../../test/utils";
import { CallbackForm } from "./CallbackForm";
import { ContactForm } from "./ContactForm";
import { ReviewForm } from "./ReviewForm";
import { SubscribeForm } from "./SubscribeForm";

describe("CallbackForm", () => {
  it("показывает ошибки и не отправляет пустую форму", async () => {
    const { requests } = mockApi();
    renderWithProviders(<CallbackForm topic="callback" />);
    await userEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    expect(screen.getByText("Укажите имя.")).toBeInTheDocument();
    expect(screen.getByText("Укажите телефон.")).toBeInTheDocument();
    expect(screen.getByText("Необходимо согласие на обработку персональных данных.")).toBeInTheDocument();
    expect(requests.filter((request) => request.method === "POST")).toHaveLength(0);
  });

  it("форматирует телефон маской и отправляет заявку с товаром", async () => {
    const { requests } = mockApi({ "POST /api/feedback/callback/": { status: 201, body: { id: 1 } } });
    renderWithProviders(<CallbackForm topic="price" productSlug="raf-100p" />);
    await userEvent.type(screen.getByLabelText(/Имя/), "Пётр");
    await userEvent.type(screen.getByLabelText(/Телефон/), "89160001122");
    expect(screen.getByLabelText(/Телефон/)).toHaveValue("+7 (916) 000-11-22");
    await userEvent.type(screen.getByLabelText("Комментарий"), "Нужно 10 штук");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    expect(await screen.findByText(/Заявка принята/)).toBeInTheDocument();
    const post = requests.find((request) => request.method === "POST");
    expect(post?.body).toEqual({
      topic: "price",
      name: "Пётр",
      phone: "+7 (916) 000-11-22",
      comment: "Нужно 10 штук",
      product: "raf-100p",
      personal_data_consent: true,
    });
  });

  it("показывает ошибку поля, пришедшую с сервера", async () => {
    mockApi({ "POST /api/feedback/callback/": { status: 400, body: { phone: ["Введите телефон в формате +7 (XXX) XXX-XX-XX."] } } });
    renderWithProviders(<CallbackForm topic="callback" />);
    await userEvent.type(screen.getByLabelText(/Имя/), "Пётр");
    await userEvent.type(screen.getByLabelText(/Телефон/), "9160001122");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    expect(await screen.findByText("Введите телефон в формате +7 (XXX) XXX-XX-XX.")).toBeInTheDocument();
    expect(screen.getByText("Проверьте правильность заполнения полей.")).toBeInTheDocument();
  });
});

describe("ContactForm", () => {
  it("проверяет длину сообщения и email", async () => {
    mockApi();
    renderWithProviders(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/Имя/), "Иван");
    await userEvent.type(screen.getByLabelText(/Email/), "ivan@");
    await userEvent.type(screen.getByLabelText(/Сообщение/), "коротко");
    await userEvent.click(screen.getByRole("button", { name: "Отправить сообщение" }));
    expect(screen.getByText("Введите корректный email.")).toBeInTheDocument();
    expect(screen.getByText("Сообщение должно быть не короче 10 символов.")).toBeInTheDocument();
  });

  it("отправляет сообщение и позволяет написать ещё", async () => {
    const { requests } = mockApi({ "POST /api/feedback/contact/": { status: 201, body: { id: 1 } } });
    renderWithProviders(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/Имя/), "Иван");
    await userEvent.type(screen.getByLabelText(/Email/), "ivan@example.com");
    await userEvent.type(screen.getByLabelText(/Сообщение/), "Нужна консультация по видеоаналитике");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Отправить сообщение" }));
    expect(await screen.findByText(/Сообщение отправлено/)).toBeInTheDocument();
    expect(requests.find((request) => request.method === "POST")?.body).toMatchObject({ email: "ivan@example.com", phone: "" });
    await userEvent.click(screen.getByRole("button", { name: "Написать ещё" }));
    expect(screen.getByLabelText(/Имя/)).toHaveValue("");
  });

  it("показывает общее сообщение при превышении лимита", async () => {
    mockApi({ "POST /api/feedback/contact/": { status: 429, body: { detail: "Запрос был проигнорирован." } } });
    renderWithProviders(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/Имя/), "Иван");
    await userEvent.type(screen.getByLabelText(/Email/), "ivan@example.com");
    await userEvent.type(screen.getByLabelText(/Сообщение/), "Нужна консультация по видеоаналитике");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Отправить сообщение" }));
    expect(await screen.findByText("Запрос был проигнорирован.")).toBeInTheDocument();
  });
});

describe("SubscribeForm и ReviewForm", () => {
  it("подписывает на рассылку", async () => {
    mockApi({ "POST /api/feedback/subscribe/": { status: 201, body: { email: "a@b.ru" } } });
    renderWithProviders(<SubscribeForm />);
    await userEvent.type(screen.getByLabelText("Email для скидок"), "a@b.ru");
    await userEvent.click(screen.getByRole("button", { name: "Подписаться" }));
    expect(await screen.findByText(/Будем присылать новости/)).toBeInTheDocument();
  });

  it("отправляет отзыв с выбранной оценкой", async () => {
    const { requests } = mockApi({ "POST /api/feedback/reviews/": { status: 201, body: { id: 1 } } });
    renderWithProviders(<ReviewForm />);
    await userEvent.type(screen.getByLabelText(/Ваше имя/), "Анна");
    await userEvent.click(screen.getByLabelText("3 из 5"));
    await userEvent.type(screen.getByLabelText(/Отзыв/), "Хороший магазин, быстро привезли.");
    await userEvent.click(screen.getByRole("button", { name: "Оставить отзыв" }));
    await waitFor(() => expect(screen.getByText(/после проверки модератором/)).toBeInTheDocument());
    expect(requests.find((request) => request.method === "POST")?.body).toEqual({
      author_name: "Анна",
      rating: 3,
      text: "Хороший магазин, быстро привезли.",
    });
  });
});
