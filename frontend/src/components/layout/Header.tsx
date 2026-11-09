/**
 * Шапка сайта: логотип, разделы, телефон, вход и корзина.
 * На главной поверх первого экрана шапка прозрачная, при прокрутке — белая.
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useSite } from "../../context/SiteContext";
import { phoneHref } from "../../lib/format";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { primaryNav } from "./navigation";
import styles from "./Header.module.css";

/**
 * Отслеживает, прокручена ли страница дальше порога.
 *
 * @param threshold Порог в пикселях.
 * @returns `true`, если страница прокручена.
 */
function useScrolled(threshold: number): boolean {
  const [scrolled, setScrolled] = useState<boolean>(false);
  useEffect(() => {
    const update = (): void => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return scrolled;
}

/**
 * Шапка сайта.
 *
 * @returns Элемент `header`.
 */
export function Header(): ReactNode {
  const { pathname } = useLocation();
  const scrolled = useScrolled(40);
  const site = useSite();
  const { count } = useCart();
  const { user } = useAuth();
  const overlay = pathname === "/" && !scrolled;
  const phone = site.phones[0];

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : styles.solid}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} aria-label="СберСити — безопасность, на главную">
          <Logo tone={overlay ? "light" : "dark"} />
        </Link>
        <nav className={styles.nav} aria-label="Основные разделы">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          {phone ? (
            <a className={styles.phone} href={phoneHref(phone)}>
              {phone}
            </a>
          ) : null}
          <Link to="/account" className={styles.iconLink} aria-label={user ? "Личный кабинет" : "Войти"}>
            <Icon name="user" />
            <span className={styles.iconLabel}>{user ? user.first_name || "Кабинет" : "Войти"}</span>
          </Link>
          <Link to="/cart" className={styles.iconLink} aria-label={`Корзина, товаров: ${count}`}>
            <Icon name="cart" />
            {count > 0 ? (
              <span className={styles.counter} data-testid="header-cart-count">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
