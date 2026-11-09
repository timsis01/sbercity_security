/**
 * Структура навигации сайта, общая для шапки, меню и подвала.
 */

/** Ссылка навигации. */
export interface NavLinkItem {
  label: string;
  to: string;
}

/** Группа ссылок. */
export interface NavGroup {
  title: string;
  links: readonly NavLinkItem[];
}

/** Основные разделы в шапке. */
export const primaryNav: readonly NavLinkItem[] = [
  { label: "Каталог", to: "/catalog" },
  { label: "Как купить", to: "/how-to-buy" },
  { label: "Доставка", to: "/delivery" },
  { label: "Гарантия", to: "/warranty" },
  { label: "О нас", to: "/about" },
  { label: "Новости", to: "/news" },
  { label: "Контакты", to: "/contacts" },
];

/** Группы ссылок для меню и подвала. */
export const footerNav: readonly NavGroup[] = [
  {
    title: "Магазин",
    links: [
      { label: "Личный кабинет", to: "/account" },
      { label: "Корзина", to: "/cart" },
      { label: "Весь каталог", to: "/catalog" },
    ],
  },
  {
    title: "Каталог",
    links: [
      { label: "Основное", to: "/catalog/osnovnoe" },
      { label: "Контроль кассовых операций", to: "/catalog/kontrol-kassovyh-operaciy" },
      { label: "Распознавание лиц", to: "/catalog/raspoznavanie-lic" },
      { label: "Пожарная безопасность", to: "/catalog/pozharnaya-bezopasnost" },
    ],
  },
  {
    title: "Покупка",
    links: [
      { label: "Как купить", to: "/how-to-buy" },
      { label: "Доставка", to: "/delivery" },
      { label: "Гарантия", to: "/warranty" },
    ],
  },
  {
    title: "О нас",
    links: [
      { label: "О компании", to: "/about" },
      { label: "Новости", to: "/news" },
      { label: "Контакты", to: "/contacts" },
    ],
  },
];
