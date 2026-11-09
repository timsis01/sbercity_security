/**
 * Типы данных REST API бэкенда.
 * Денежные суммы приходят строками с двумя знаками после запятой, как их отдаёт Django.
 */

/** Страница постраничной выдачи DRF. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Сведения о компании для шапки и подвала. */
export interface SiteInfo {
  company_name: string;
  legal_name: string;
  inn: string;
  phones: string[];
  sales_email: string;
  info_email: string;
  address: string;
  working_hours: string;
  office_hours: string;
  telegram: string;
  delivery_cost: number;
}

/** Элемент хлебных крошек. */
export interface Breadcrumb {
  name: string;
  slug: string;
}

/** Узел дерева категорий. */
export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
  children: CategoryNode[];
}

/** Категория с путём от корня. */
export interface CategoryDetail extends CategoryNode {
  breadcrumbs: Breadcrumb[];
}

/** Краткое описание категории в карточке товара. */
export interface CategoryShort {
  id: number;
  name: string;
  slug: string;
}

/** Товар в списке каталога. */
export interface ProductListItem {
  id: number;
  title: string;
  slug: string;
  sku: string;
  brand: string;
  price: string | null;
  old_price: string | null;
  is_price_on_request: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  in_stock: boolean;
  image: string | null;
  visual: string;
  category: CategoryShort;
}

/** Строка характеристик товара. */
export interface ProductSpec {
  name: string;
  value: string;
}

/** Полная карточка товара. */
export interface ProductDetail extends ProductListItem {
  manufacturer: string;
  description: string;
  requirements: string;
  specs: ProductSpec[];
  breadcrumbs: Breadcrumb[];
}

/** Параметры запроса списка товаров. */
export interface ProductQuery {
  category?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  is_bestseller?: boolean;
  in_stock?: boolean;
}

/** Новость в ленте. */
export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  published_at: string;
}

/** Полный текст новости. */
export interface ArticleDetail extends ArticleListItem {
  body: string;
}

/** Способ доставки. */
export type DeliveryMethod = "pickup" | "courier";

/** Способ оплаты. */
export type PaymentMethod = "cash" | "card" | "invoice";

/** Позиция корзины в запросе к API. */
export interface CartItemPayload {
  product: string;
  quantity: number;
}

/** Запрос расчёта корзины. */
export interface QuoteRequest {
  items: CartItemPayload[];
  delivery_method: DeliveryMethod;
  promo_code?: string;
}

/** Итоги корзины, рассчитанные сервером. */
export interface Quote {
  subtotal: string;
  discount: string;
  delivery_cost: string;
  total: string;
  discount_percent: number;
}

/** Действующий промокод. */
export interface PromoResult {
  code: string;
  discount_percent: number;
}

/** Данные формы оформления заказа. */
export interface OrderCreatePayload {
  items: CartItemPayload[];
  customer_name: string;
  phone: string;
  email: string;
  company: string;
  inn: string;
  delivery_method: DeliveryMethod;
  address: string;
  payment_method: PaymentMethod;
  comment: string;
  promo_code: string;
  personal_data_consent: boolean;
}

/** Позиция оформленного заказа. */
export interface OrderItem {
  id: number;
  product_slug: string | null;
  title: string;
  sku: string;
  price: string;
  quantity: number;
  line_total: string;
}

/** Оформленный заказ. */
export interface Order {
  number: string;
  status: string;
  status_display: string;
  customer_name: string;
  phone: string;
  email: string;
  company: string;
  inn: string;
  delivery_method: DeliveryMethod;
  delivery_method_display: string;
  address: string;
  payment_method: PaymentMethod;
  payment_method_display: string;
  comment: string;
  promo_code: string | null;
  subtotal: string;
  discount: string;
  delivery_cost: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}

/** Профиль пользователя. */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  date_joined: string;
}

/** Данные регистрации. */
export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
}

/** Данные входа. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Редактируемые поля профиля. */
export type ProfilePatch = Partial<Pick<User, "first_name" | "last_name" | "phone" | "company">>;

/** Тема заявки обратной связи. */
export type CallbackTopic = "callback" | "price" | "quick_order" | "consultation";

/** Заявка на звонок, запрос цены или быстрый заказ. */
export interface CallbackPayload {
  topic: CallbackTopic;
  name: string;
  phone: string;
  product?: string | null;
  comment: string;
  personal_data_consent: boolean;
}

/** Сообщение со страницы контактов. */
export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  personal_data_consent: boolean;
}

/** Опубликованный отзыв. */
export interface Review {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
}

/** Новый отзыв. */
export interface ReviewPayload {
  author_name: string;
  rating: number;
  text: string;
}

/** Сводный рейтинг магазина. */
export interface ReviewSummary {
  average: number | null;
  count: number;
}
