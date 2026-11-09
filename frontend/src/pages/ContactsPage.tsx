/**
 * Страница «Контакты»: адрес, телефоны, режим работы и форма сообщения.
 */
import type { ReactNode } from "react";
import { ContactForm } from "../components/forms/ContactForm";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Icon } from "../components/ui/Icon";
import { useSite } from "../context/SiteContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { phoneHref } from "../lib/format";
import styles from "./ContactsPage.module.css";

/**
 * Страница контактов.
 *
 * @returns Разметка страницы.
 */
export function ContactsPage(): ReactNode {
  useDocumentTitle("Контакты");
  const site = useSite();
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "Контакты" }]} />
          <h1 className="h1">Контакты</h1>
          <p className="lead">Ваш надёжный партнёр в безопасности и автоматизации бизнес-процессов. Создаём решения для компаний любого масштаба.</p>
        </header>
        <div className={styles.layout}>
          <div className={styles.info}>
            <div className={styles.map} aria-hidden="true">
              <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
                <rect width="400" height="240" fill="#1d2629" />
                <path d="M0 170 C 80 150, 140 200, 220 175 S 340 140, 400 160" stroke="#41b496" strokeOpacity="0.5" strokeWidth="10" fill="none" />
                <g stroke="#4d616a" strokeWidth="1" fill="none">
                  <path d="M40 0v240M120 0v240M200 0v240M280 0v240M360 0v240M0 40h400M0 100h400M0 220h400" />
                </g>
                <g fill="#263236" stroke="#4d616a">
                  <rect x="60" y="56" width="44" height="30" />
                  <rect x="136" y="50" width="52" height="40" />
                  <rect x="216" y="58" width="48" height="32" />
                  <rect x="294" y="48" width="50" height="42" />
                  <rect x="70" y="112" width="36" height="34" />
                  <rect x="296" y="110" width="44" height="26" />
                </g>
                <circle cx="232" cy="120" r="26" fill="#41b496" fillOpacity="0.18" />
                <path d="M232 92c-11 0-20 9-20 20 0 15 20 32 20 32s20-17 20-32c0-11-9-20-20-20z" fill="#41b496" />
                <circle cx="232" cy="112" r="7" fill="#151b1e" />
              </svg>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>
                  <Icon name="pin" /> Адрес
                </dt>
                <dd>{site.address}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="phone" /> Телефон
                </dt>
                <dd className={styles.phones}>
                  {site.phones.map((phone) => (
                    <a key={phone} href={phoneHref(phone)}>
                      {phone}
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="mail" /> Email
                </dt>
                <dd className={styles.phones}>
                  {site.info_email ? <a href={`mailto:${site.info_email}`}>{site.info_email}</a> : null}
                  {site.sales_email ? <a href={`mailto:${site.sales_email}`}>{site.sales_email}</a> : null}
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="clock" /> Время работы
                </dt>
                <dd>
                  Офис: {site.office_hours}
                  <br />
                  Магазин: {site.working_hours}
                </dd>
              </div>
              {site.telegram ? (
                <div>
                  <dt>
                    <Icon name="send" /> Telegram
                  </dt>
                  <dd>
                    <a href={site.telegram} target="_blank" rel="noopener noreferrer">
                      Написать в Telegram
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <section className={styles.formWrap} aria-labelledby="contact-form-title">
            <h2 id="contact-form-title" className={styles.formTitle}>
              Отправить сообщение
            </h2>
            <p className="muted" style={{ marginBottom: 24 }}>
              Поделитесь идеями или пожеланиями по работе магазина. Довольны заказом или есть замечания — будем рады нескольким строкам.
            </p>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}
