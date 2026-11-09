/**
 * Корневой компонент: провайдеры контекстов и маршруты приложения.
 */
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SiteProvider } from "./context/SiteContext";
import { UiProvider } from "./context/UiContext";
import { AboutPage } from "./pages/AboutPage";
import { AccountPage } from "./pages/AccountPage";
import { CartPage } from "./pages/CartPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ContactsPage } from "./pages/ContactsPage";
import { HomePage } from "./pages/HomePage";
import { DeliveryPage, HowToBuyPage, PrivacyPage, WarrantyPage } from "./pages/InfoPages";
import { NewsDetailPage, NewsListPage } from "./pages/NewsPages";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { ProductPage } from "./pages/ProductPage";

/**
 * Маршруты сайта внутри общего каркаса.
 *
 * @returns Дерево маршрутов.
 */
export function AppRoutes(): ReactNode {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/:slug" element={<CatalogPage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:number" element={<OrderSuccessPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="news" element={<NewsListPage />} />
        <Route path="news/:slug" element={<NewsDetailPage />} />
        <Route path="how-to-buy" element={<HowToBuyPage />} />
        <Route path="delivery" element={<DeliveryPage />} />
        <Route path="warranty" element={<WarrantyPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/**
 * Приложение с провайдерами состояния.
 *
 * @returns Корневой элемент.
 */
export function App(): ReactNode {
  return (
    <SiteProvider>
      <AuthProvider>
        <CartProvider>
          <UiProvider>
            <AppRoutes />
          </UiProvider>
        </CartProvider>
      </AuthProvider>
    </SiteProvider>
  );
}
