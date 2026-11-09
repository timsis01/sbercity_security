/**
 * Полноэкранное меню сайта с разделами и контактами.
 */
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../../context/SiteContext";
import { phoneHref } from "../../lib/format";
import { footerNav } from "./navigation";
import styles from "./MenuOverlay.module.css";

/** Свойства меню. */
interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Меню поверх страницы; закрывается по Escape и при переходе по ссылке.
 *
 * @param props Флаг открытия и обработчик закрытия.
 * @returns Панель меню.
 */
export function MenuOverlay({ open, onClose }: MenuOverlayProps): ReactNode {
  const site = useSite();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div id="site-menu" className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open} inert={!open}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.groups}>
          {footerNav.map((group) => (
            <div key={group.title} className={styles.group}>
              <p className={styles.groupTitle}>{group.title}</p>
              <ul className={styles.list}>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.link} onClick={onClose}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.contacts}>
          {site.phones.map((phone) => (
            <a key={phone} href={phoneHref(phone)} className={styles.phone}>
              {phone}
            </a>
          ))}
          {site.sales_email ? <a href={`mailto:${site.sales_email}`}>{site.sales_email}</a> : null}
          <span className={styles.muted}>{site.working_hours}</span>
        </div>
      </div>
    </div>
  );
}
