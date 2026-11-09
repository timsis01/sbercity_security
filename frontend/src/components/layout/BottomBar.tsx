/**
 * Нижняя навигационная панель в стиле СберСити с акцентной кнопкой «Связаться».
 */
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUi } from "../../context/UiContext";
import { Icon } from "../ui/Icon";
import type { IconName } from "../ui/Icon";
import styles from "./BottomBar.module.css";

/** Свойства нижней панели. */
interface BottomBarProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
}

/** Ссылка панели. */
interface BarLink {
  to: string;
  label: string;
  icon: IconName;
}

const links: readonly BarLink[] = [
  { to: "/catalog", label: "Каталог", icon: "catalog" },
  { to: "/news", label: "Новости", icon: "news" },
];

/**
 * Фиксированная нижняя панель: каталог, новости, «Связаться», корзина и меню.
 *
 * @param props Состояние меню и обработчик его переключения.
 * @returns Навигационная панель.
 */
export function BottomBar({ menuOpen, onToggleMenu }: BottomBarProps): ReactNode {
  const { count } = useCart();
  const { openCallback } = useUi();
  return (
    <nav className={styles.bar} aria-label="Быстрая навигация">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}>
          <Icon name={link.icon} />
          <span>{link.label}</span>
        </NavLink>
      ))}
      <button type="button" className={`${styles.item} ${styles.contact}`} onClick={() => openCallback({ topic: "callback" })}>
        <Icon name="phone" />
        <span>Связаться</span>
      </button>
      <NavLink to="/cart" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}>
        <span className={styles.iconWrap}>
          <Icon name="cart" />
          {count > 0 ? <span className={styles.badge}>{count}</span> : null}
        </span>
        <span>Корзина</span>
      </NavLink>
      <button type="button" className={`${styles.item} ${menuOpen ? styles.active : ""}`} onClick={onToggleMenu} aria-expanded={menuOpen} aria-controls="site-menu">
        <Icon name={menuOpen ? "close" : "menu"} />
        <span>{menuOpen ? "Закрыть" : "Меню"}</span>
      </button>
    </nav>
  );
}
