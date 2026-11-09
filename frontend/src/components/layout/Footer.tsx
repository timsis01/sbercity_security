/**
 * Подвал сайта: разделы, контакты и юридическая информация.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../../context/SiteContext";
import { phoneHref } from "../../lib/format";
import { Logo } from "../ui/Logo";
import { footerNav } from "./navigation";
import styles from "./Footer.module.css";

/**
 * Подвал сайта.
 *
 * @returns Элемент `footer`.
 */
export function Footer(): ReactNode {
  const site = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo tone="light" />
            <p className={styles.about}>Интернет-магазин систем видеоаналитики, безопасности и пожаротушения. Официальный дилер VIDEOSAPIENS®.</p>
          </div>
          <nav className={styles.columns} aria-label="Разделы сайта">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className={styles.title}>{group.title}</p>
                <ul className={styles.list}>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <address className={styles.contacts}>
            <p className={styles.title}>Контакты</p>
            {site.phones.map((phone) => (
              <a key={phone} href={phoneHref(phone)} className={styles.phone}>
                {phone}
              </a>
            ))}
            {site.sales_email ? <a href={`mailto:${site.sales_email}`}>{site.sales_email}</a> : null}
            <span>Время работы: {site.working_hours}</span>
            {site.address ? <span>{site.address}</span> : null}
          </address>
        </div>
        <div className={styles.bottom}>
          <span>
            © {year} {site.legal_name}
            {site.inn ? `, ИНН ${site.inn}` : ""}
          </span>
          <Link to="/privacy">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}
