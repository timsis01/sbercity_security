/**
 * Интеграционные тесты сценариев магазина: карточка, корзина, оформление, каталог, кабинет.
 */
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Order } from "../api/types";
import { ProductCard } from "../components/catalog/ProductCard";
import { CallbackModal } from "../components/forms/CallbackModal";
import { Header } from "../components/layout/Header";
import { CART_STORAGE_KEY } from "../context/CartContext";
import { makeProduct, mockApi, renderWithProviders } from "../test/utils";
import { AccountPage } from "./AccountPage";
import { CartPage } from "./CartPage";
import { CatalogPage } from "./CatalogPage";
import { CheckoutPage } from "./CheckoutPage";

const quote = { subtotal: "16000.00", discount: "0.00", delivery_cost: "0.00", total: "16000.00", discount_percent: 0 };

/**
 * Кладёт в корзину два HASP-ключа.
 */
function seedCart(): void {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      lines: [{ slug: "hasp-klyuch", title: "HASP-ключ", sku: "VS-HASP", price: "8000.00", categorySlug: "oborudovanie", visual: "usb-key", quantity: 2 }],
      promoCode: "",
    }),
  );
}

describe("ProductCard", () => {
  it("добавляет товар в корзину и обновляет счётчик в шапке", async () => {
    mockApi();
    renderWithProviders(
      <>
        <Header />
        <ProductCard product={makeProduct()} />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "В корзину: HASP-ключ" }));
    await userEvent.click(screen.getByRole("button", { name: "В корзину: HASP-ключ" }));
    expect(screen.getByTestId("header-cart-count")).toHaveTextContent("2");
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "{}").lines[0].quantity).toBe(2);
  });

  it("для товара с ценой по запросу открывает окно заявки", async () => {
    mockApi();
    renderWithProviders(
      <>
        <ProductCard product={makeProduct({ title: "РАФ-100П", slug: "raf-100p", price: null, is_price_on_request: true })} />
        <CallbackModal />
      </>,
    );
    expect(screen.getByText("Цена по запросу")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Запросить цену" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(within(dialog).getByRole("heading", { name: "Запросить цену", hidden: true })).toBeInTheDocument();
    expect(within(dialog).getByText("РАФ-100П")).toBeInTheDocument();
  });
});

describe("CartPage", () => {
  it("показывает пустую корзину", () => {
    mockApi();
    renderWithProviders(<CartPage />);
    expect(screen.getByText("В корзине пока пусто")).toBeInTheDocument();
  });

  it("пересчитывает итог на сервере и применяет промокод", async () => {
    seedCart();
    const { requests } = mockApi({}, ({ method, path, body }) => {
      if (method === "POST" && path === "/api/orders/quote/") {
        const promo = (body as { promo_code?: string }).promo_code;
        return { body: promo ? { ...quote, discount: "1600.00", total: "14400.00", discount_percent: 10 } : quote };
      }
      if (method === "POST" && path === "/api/orders/promo/") {
        return { body: { code: "SBERCITY10", discount_percent: 10 } };
      }
      return undefined;
    });
    renderWithProviders(<CartPage />);
    expect(screen.getAllByTestId("cart-line")).toHaveLength(1);
    await waitFor(() => expect(screen.getByTestId("order-total")).toHaveTextContent(/16\s000\s₽/));
    await userEvent.type(screen.getByLabelText("Код скидки"), "sbercity10");
    await userEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(await screen.findByText(/применён/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("order-total")).toHaveTextContent(/14\s400\s₽/));
    expect(screen.getByText("Скидка по промокоду (10%)")).toBeInTheDocument();
    const lastQuote = requests.filter((request) => request.path === "/api/orders/quote/").at(-1);
    expect(lastQuote?.body).toEqual({ items: [{ product: "hasp-klyuch", quantity: 2 }], delivery_method: "pickup", promo_code: "SBERCITY10" });
  });

  it("показывает ошибку недействительного промокода и удаляет позицию", async () => {
    seedCart();
    mockApi({
      "POST /api/orders/quote/": { body: quote },
      "POST /api/orders/promo/": { status: 400, body: { promo_code: ["Промокод не найден или срок его действия истёк."] } },
    });
    renderWithProviders(<CartPage />);
    await userEvent.type(screen.getByLabelText("Код скидки"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(await screen.findByText("Промокод не найден или срок его действия истёк.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Удалить HASP-ключ" }));
    expect(screen.getByText("В корзине пока пусто")).toBeInTheDocument();
  });
});

describe("CheckoutPage", () => {
  it("перенаправляет в корзину, если она пуста", () => {
    mockApi();
    renderWithProviders(<CheckoutPage />, { route: "/checkout", path: "/checkout" });
    expect(screen.getByText("Страница корзины")).toBeInTheDocument();
  });

  it("требует адрес для курьера и оформляет заказ", async () => {
    seedCart();
    const order: Partial<Order> = { number: "SC-261109-ABCDE" };
    const { requests } = mockApi({
      "POST /api/orders/quote/": { body: quote },
      "POST /api/orders/": { status: 201, body: order },
    });
    renderWithProviders(<CheckoutPage />, { route: "/checkout", path: "/checkout" });
    await userEvent.type(screen.getByLabelText(/ФИО получателя/), "Иван Петров");
    await userEvent.type(screen.getByLabelText(/Телефон/), "9161234567");
    await userEvent.type(screen.getByLabelText(/^Email/), "ivan@example.com");
    await userEvent.click(screen.getByRole("radio", { name: /Курьером/ }));
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить заказ" }));
    expect(screen.getByText("Укажите адрес доставки.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Адрес доставки/), "Москва, ул. Тестовая, 1");
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить заказ" }));
    expect(await screen.findByText("Страница заказа")).toBeInTheDocument();
    expect(requests.find((request) => request.method === "POST" && request.path === "/api/orders/")?.body).toEqual({
      items: [{ product: "hasp-klyuch", quantity: 2 }],
      customer_name: "Иван Петров",
      phone: "+7 (916) 123-45-67",
      email: "ivan@example.com",
      company: "",
      inn: "",
      delivery_method: "courier",
      address: "Москва, ул. Тестовая, 1",
      payment_method: "cash",
      comment: "",
      promo_code: "",
      personal_data_consent: true,
    });
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "{}").lines).toEqual([]);
  });

  it("показывает ошибку сервера у позиции корзины", async () => {
    seedCart();
    mockApi({
      "POST /api/orders/quote/": { body: quote },
      "POST /api/orders/": { status: 400, body: { items: ["Товар «hasp-klyuch» не найден."] } },
    });
    renderWithProviders(<CheckoutPage />, { route: "/checkout", path: "/checkout" });
    await userEvent.type(screen.getByLabelText(/ФИО получателя/), "Иван Петров");
    await userEvent.type(screen.getByLabelText(/Телефон/), "9161234567");
    await userEvent.type(screen.getByLabelText(/^Email/), "ivan@example.com");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить заказ" }));
    expect(await screen.findByText("Товар «hasp-klyuch» не найден.")).toBeInTheDocument();
  });
});

describe("CatalogPage", () => {
  it("загружает товары категории и выполняет поиск", async () => {
    const { requests } = mockApi(
      {
        "GET /api/catalog/categories/": { body: [{ id: 1, name: "Оборудование", slug: "oborudovanie", description: "", product_count: 1, children: [] }] },
        "GET /api/catalog/categories/oborudovanie/": {
          body: { id: 1, name: "Оборудование", slug: "oborudovanie", description: "Аппаратные комплексы", product_count: 1, children: [], breadcrumbs: [{ name: "Оборудование", slug: "oborudovanie" }] },
        },
      },
      ({ path }) => (path.startsWith("/api/catalog/products/") ? { body: { count: 1, next: null, previous: null, results: [makeProduct()] } } : undefined),
    );
    renderWithProviders(<CatalogPage />, { route: "/catalog/oborudovanie", path: "/catalog/:slug" });
    expect(await screen.findByRole("heading", { level: 1, name: "Оборудование" })).toBeInTheDocument();
    expect(await screen.findByText("HASP-ключ")).toBeInTheDocument();
    expect(screen.getByText(/Найдено 1 товар/)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Поиск по каталогу"), "hasp");
    await userEvent.click(screen.getByRole("button", { name: "Найти" }));
    await waitFor(() => expect(requests.some((request) => request.path.includes("search=hasp") && request.path.includes("category=oborudovanie"))).toBe(true));
  });

  it("показывает пустой результат", async () => {
    mockApi({ "GET /api/catalog/categories/": { body: [] } }, ({ path }) =>
      path.startsWith("/api/catalog/products/") ? { body: { count: 0, next: null, previous: null, results: [] } } : undefined,
    );
    renderWithProviders(<CatalogPage />, { route: "/catalog?q=zzz", path: "/catalog" });
    expect(await screen.findByText("Ничего не найдено")).toBeInTheDocument();
  });
});

describe("AccountPage", () => {
  it("показывает ошибку входа и затем входит", async () => {
    let attempts = 0;
    mockApi({}, ({ method, path }) => {
      if (method === "POST" && path === "/api/auth/login/") {
        attempts += 1;
        return attempts === 1
          ? { status: 400, body: { non_field_errors: ["Неверный email или пароль."] } }
          : { body: { id: 1, email: "buyer@example.com", first_name: "Анна", last_name: "", phone: "", company: "", date_joined: "2026-11-01T00:00:00Z" } };
      }
      if (path.startsWith("/api/orders/")) {
        return { body: { count: 0, next: null, previous: null, results: [] } };
      }
      return undefined;
    });
    renderWithProviders(<AccountPage />);
    await userEvent.type(await screen.findByLabelText(/Email/), "buyer@example.com");
    await userEvent.type(screen.getByLabelText(/Пароль/), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));
    expect(await screen.findByText("Неверный email или пароль.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));
    expect(await screen.findByRole("heading", { name: "Здравствуйте, Анна" })).toBeInTheDocument();
    expect(await screen.findByText("Заказов пока нет")).toBeInTheDocument();
  });

  it("переключается на регистрацию и проверяет пароль", async () => {
    mockApi();
    renderWithProviders(<AccountPage />);
    await userEvent.click(await screen.findByRole("tab", { name: "Регистрация" }));
    await userEvent.type(screen.getByLabelText(/Имя/), "Анна");
    await userEvent.type(screen.getByLabelText(/Email/), "anna@example.com");
    await userEvent.type(screen.getByLabelText(/Пароль/), "123");
    await userEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    expect(screen.getByText("Пароль должен быть не короче 8 символов.")).toBeInTheDocument();
  });
});
