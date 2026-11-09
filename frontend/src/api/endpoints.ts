/**
 * Типизированные функции обращения к эндпоинтам бэкенда.
 */
import { request } from "./client";
import type {
  ArticleDetail,
  ArticleListItem,
  CallbackPayload,
  CategoryDetail,
  CategoryNode,
  ContactPayload,
  LoginPayload,
  Order,
  OrderCreatePayload,
  Paginated,
  ProductDetail,
  ProductListItem,
  ProductQuery,
  ProfilePatch,
  PromoResult,
  Quote,
  QuoteRequest,
  RegisterPayload,
  Review,
  ReviewPayload,
  ReviewSummary,
  SiteInfo,
  User,
} from "./types";

/** Набор функций API, сгруппированных по разделам. */
export const api = {
  site: (): Promise<SiteInfo> => request<SiteInfo>("/site/"),

  categories: (): Promise<CategoryNode[]> => request<CategoryNode[]>("/catalog/categories/"),
  category: (slug: string): Promise<CategoryDetail> => request<CategoryDetail>(`/catalog/categories/${encodeURIComponent(slug)}/`),
  products: (query: ProductQuery = {}, signal?: AbortSignal): Promise<Paginated<ProductListItem>> =>
    request<Paginated<ProductListItem>>("/catalog/products/", { query: { ...query }, signal }),
  product: (slug: string): Promise<ProductDetail> => request<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}/`),
  relatedProducts: (slug: string): Promise<ProductListItem[]> =>
    request<ProductListItem[]>(`/catalog/products/${encodeURIComponent(slug)}/related/`),

  news: (page = 1, pageSize = 9): Promise<Paginated<ArticleListItem>> =>
    request<Paginated<ArticleListItem>>("/news/", { query: { page, page_size: pageSize } }),
  article: (slug: string): Promise<ArticleDetail> => request<ArticleDetail>(`/news/${encodeURIComponent(slug)}/`),

  quote: (payload: QuoteRequest): Promise<Quote> => request<Quote>("/orders/quote/", { method: "POST", body: payload }),
  validatePromo: (code: string): Promise<PromoResult> => request<PromoResult>("/orders/promo/", { method: "POST", body: { code } }),
  createOrder: (payload: OrderCreatePayload): Promise<Order> => request<Order>("/orders/", { method: "POST", body: payload }),
  order: (number: string): Promise<Order> => request<Order>(`/orders/${encodeURIComponent(number)}/`),
  myOrders: (): Promise<Paginated<Order>> => request<Paginated<Order>>("/orders/", { query: { page_size: 50 } }),

  me: (): Promise<User> => request<User>("/auth/me/"),
  login: (payload: LoginPayload): Promise<User> => request<User>("/auth/login/", { method: "POST", body: payload }),
  register: (payload: RegisterPayload): Promise<User> => request<User>("/auth/register/", { method: "POST", body: payload }),
  logout: async (): Promise<void> => {
    await request<unknown>("/auth/logout/", { method: "POST" });
  },
  updateProfile: (patch: ProfilePatch): Promise<User> => request<User>("/auth/me/", { method: "PATCH", body: patch }),

  sendCallback: (payload: CallbackPayload): Promise<unknown> => request<unknown>("/feedback/callback/", { method: "POST", body: payload }),
  sendContact: (payload: ContactPayload): Promise<unknown> => request<unknown>("/feedback/contact/", { method: "POST", body: payload }),
  subscribe: (email: string): Promise<{ email: string }> =>
    request<{ email: string }>("/feedback/subscribe/", { method: "POST", body: { email } }),
  reviews: (): Promise<Paginated<Review>> => request<Paginated<Review>>("/feedback/reviews/", { query: { page_size: 6 } }),
  reviewSummary: (): Promise<ReviewSummary> => request<ReviewSummary>("/feedback/reviews/summary/"),
  sendReview: (payload: ReviewPayload): Promise<Review> => request<Review>("/feedback/reviews/", { method: "POST", body: payload }),
};
