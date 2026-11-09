/**
 * Общий каркас страниц: шапка, содержимое, подвал, нижняя панель и глобальные окна.
 */
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CallbackModal } from "../forms/CallbackModal";
import { Toasts } from "../ui/Toasts";
import { BottomBar } from "./BottomBar";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MenuOverlay } from "./MenuOverlay";
import styles from "./Layout.module.css";

/**
 * Каркас приложения; при смене страницы прокручивает к началу и закрывает меню.
 *
 * @returns Разметка страницы с вложенным маршрутом.
 */
export function Layout(): ReactNode {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className={styles.app}>
      <a href="#main" className={styles.skip}>
        Перейти к содержимому
      </a>
      <Header />
      <main id="main" className={pathname === "/" ? styles.mainHome : styles.main}>
        <Outlet />
      </main>
      <Footer />
      <MenuOverlay open={menuOpen} onClose={closeMenu} />
      <BottomBar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((value) => !value)} />
      <CallbackModal />
      <Toasts />
    </div>
  );
}
