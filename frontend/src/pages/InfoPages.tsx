/**
 * Информационные страницы: «Как купить», «Доставка», «Гарантия», «Политика конфиденциальности».
 */
import type { ReactNode } from "react";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { ButtonLink } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import type { IconName } from "../components/ui/Icon";
import { useSite } from "../context/SiteContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice, phoneHref } from "../lib/format";
import styles from "./InfoPages.module.css";

/** Свойства обёртки информационной страницы. */
interface InfoLayoutProps {
  title: string;
  lead: string;
  children: ReactNode;
}

/**
 * Общий каркас информационной страницы.
 *
 * @param props Заголовок, вводный текст и содержимое.
 * @returns Разметка страницы.
 */
function InfoLayout({ title, lead, children }: InfoLayoutProps): ReactNode {
  useDocumentTitle(title);
  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: title }]} />
          <h1 className="h1">{title}</h1>
          <p className="lead">{lead}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

/**
 * Блок контактов для вопросов и претензий.
 *
 * @returns Блок контактов.
 */
function ContactStrip(): ReactNode {
  const site = useSite();
  return (
    <div className={styles.strip}>
      <p className={styles.stripTitle}>Остались вопросы, пожелания или претензии?</p>
      <div className={styles.stripLinks}>
        {site.sales_email ? (
          <a href={`mailto:${site.sales_email}`}>
            <Icon name="mail" />
            {site.sales_email}
          </a>
        ) : null}
        {site.phones[0] ? (
          <a href={phoneHref(site.phones[0])}>
            <Icon name="phone" />
            {site.phones[0]}
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** Шаг процесса покупки. */
interface Step {
  icon: IconName;
  title: string;
  text: string;
}

const buySteps: readonly Step[] = [
  { icon: "catalog", title: "Выберите товар", text: "Найдите нужные лицензии, оборудование или услуги в каталоге и нажмите «В корзину»." },
  { icon: "cart", title: "Проверьте корзину", text: "Измените количество, удалите лишнее, введите код скидки — итог пересчитается автоматически." },
  { icon: "user", title: "Укажите данные", text: "ФИО получателя, телефон, email, способ доставки и оплаты. Для юрлиц — организацию и ИНН." },
  { icon: "check", title: "Подтвердите заказ", text: "Копия заказа придёт на email, а менеджер позвонит, чтобы согласовать сроки и детали." },
];

/**
 * Страница «Как купить».
 *
 * @returns Разметка страницы.
 */
export function HowToBuyPage(): ReactNode {
  return (
    <InfoLayout title="Как купить" lead="Покупка в интернет-магазине занимает несколько минут и проходит в четыре шага.">
      <ol className={`grid ${styles.steps}`}>
        {buySteps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
            <Icon name={step.icon} size={28} className={styles.stepIcon} />
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className="muted">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className={`prose ${styles.body}`}>
        <h2>Оформление заказа</h2>
        <p>
          После выбора товара нажмите «В корзину». Когда закончите выбор, перейдите в корзину: там перечислены все товары, их количество и стоимость. Количество
          можно изменить, позицию — удалить, а в поле «Код скидки» ввести промокод.
        </p>
        <h2>Подтверждение заказа</h2>
        <p>
          Укажите данные получателя, способ доставки и оплаты и нажмите «Подтвердить заказ». Копия заказа будет отправлена на email, указанный при оформлении.
        </p>
        <p>
          Внимание! Неправильно указанный номер телефона, неточный или неполный адрес могут привести к задержке. Пожалуйста, внимательно проверяйте данные. После
          оформления менеджер свяжется с вами, чтобы согласовать время и сроки доставки и уточнить детали.
        </p>
        <h2>Товары с ценой по запросу</h2>
        <p>Стоимость части оборудования зависит от объёма и условий поставки. Для таких товаров нажмите «Запросить цену» — менеджер подготовит предложение.</p>
      </div>
      <div className={styles.cta}>
        <ButtonLink to="/catalog" size="lg">
          Перейти в каталог
        </ButtonLink>
      </div>
      <ContactStrip />
    </InfoLayout>
  );
}

/**
 * Страница «Доставка».
 *
 * @returns Разметка страницы.
 */
export function DeliveryPage(): ReactNode {
  const site = useSite();
  return (
    <InfoLayout title="Доставка" lead="Доставляем любой товар по Москве и во все регионы России. Самовывоз — бесплатно.">
      <div className={`grid ${styles.cards}`}>
        <div className={styles.card}>
          <Icon name="truck" size={28} className={styles.stepIcon} />
          <span className={styles.cardValue}>{formatPrice(site.delivery_cost)}</span>
          <h2 className={styles.stepTitle}>Курьером по Москве</h2>
          <p className="muted">Доставка по адресу, указанному при оформлении. Другой адрес можно сообщить менеджеру после заказа.</p>
        </div>
        <div className={styles.card}>
          <Icon name="pin" size={28} className={styles.stepIcon} />
          <span className={styles.cardValue}>0 ₽</span>
          <h2 className={styles.stepTitle}>Самовывоз</h2>
          <p className="muted">{site.address || "Из офиса в СберСити"}. Время работы: {site.working_hours}.</p>
        </div>
        <div className={styles.card}>
          <Icon name="send" size={28} className={styles.stepIcon} />
          <span className={styles.cardValue}>Онлайн</span>
          <h2 className={styles.stepTitle}>Лицензии ПО</h2>
          <p className="muted">Электронные лицензии отправляем на email после оплаты — без ожидания курьера.</p>
        </div>
      </div>
      <div className={`prose ${styles.body}`}>
        <h2>Когда возможна доставка</h2>
        <p>Время доставки согласовывает менеджер службы доставки, который свяжется с вами сразу после размещения заказа. Доставка выполняется в рабочее время.</p>
        <ul>
          <li>если заказ подтверждён до 12:00 — доставка на следующий рабочий день с 10:00 до 15:00 или с 15:00 до 19:00;</li>
          <li>если заказ подтверждён после 12:00 — доставка на следующий рабочий день с 15:00 до 19:00.</li>
        </ul>
        <h2>Правила</h2>
        <p>
          При доставке передаются документы на покупку: товарный и кассовый чеки, гарантийный талон. При покупке на организацию — счёт-фактура (УПД) и накладная, на
          которой нужно поставить печать организации.
        </p>
        <p>
          Технические параметры и потребительские свойства товара уточняйте у менеджера до покупки — курьеры не консультируют по характеристикам. Если требуется
          монтаж, сообщите об этом менеджеру.
        </p>
        <p>При получении проверьте комплектность, работоспособность, соответствие описанию на сайте и отсутствие механических повреждений.</p>
      </div>
      <ContactStrip />
    </InfoLayout>
  );
}

/**
 * Страница «Гарантия».
 *
 * @returns Разметка страницы.
 */
export function WarrantyPage(): ReactNode {
  return (
    <InfoLayout title="Гарантия" lead="Все товары сертифицированы и обеспечены фирменной гарантией производителей.">
      <div className={styles.columns}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Для гарантийного обслуживания нужны</h2>
          <ul className={styles.checklist}>
            <li>
              <Icon name="check" />
              Документ, подтверждающий покупку (товарная накладная или УПД)
            </li>
            <li>
              <Icon name="check" />
              Полная комплектация товара
            </li>
          </ul>
        </section>
        <section className={`${styles.panel} ${styles.panelDark}`}>
          <h2 className={styles.panelTitle}>Гарантия не действует, если</h2>
          <ul className={styles.checklist}>
            <li>
              <Icon name="close" />
              Оборудование установлено на объекте вне зоны действия договора
            </li>
            <li>
              <Icon name="close" />
              Есть следы механического повреждения или вскрытия
            </li>
            <li>
              <Icon name="close" />
              Нарушены заводские пломбы
            </li>
            <li>
              <Icon name="close" />
              Нарушены условия эксплуатации, транспортировки или хранения
            </li>
            <li>
              <Icon name="close" />
              Ремонт выполнялся вне авторизованного сервисного центра
            </li>
            <li>
              <Icon name="close" />
              Заменены комплектующие
            </li>
          </ul>
        </section>
      </div>
      <div className={`prose ${styles.body}`}>
        <p>
          При получении и оплате заказа проверьте в присутствии курьера комплектацию и внешний вид изделия: отсутствие царапин, трещин, сколов и полноту комплекта.
          После отъезда курьера претензии по этим вопросам не принимаются.
        </p>
        <p>Подробные условия гарантии приведены в документации к товару и на сайте производителя.</p>
      </div>
      <ContactStrip />
    </InfoLayout>
  );
}

/**
 * Страница политики конфиденциальности.
 *
 * @returns Разметка страницы.
 */
export function PrivacyPage(): ReactNode {
  const site = useSite();
  return (
    <InfoLayout title="Политика конфиденциальности" lead="Как мы обрабатываем и защищаем персональные данные покупателей.">
      <div className={`prose ${styles.body}`}>
        <h2>Какие данные мы получаем</h2>
        <p>Имя, телефон, email, адрес доставки, название организации и ИНН — только то, что вы указываете в формах заказа, заявки или регистрации.</p>
        <h2>Зачем</h2>
        <p>Для обработки заказов и заявок, связи с вами, доставки, выставления документов и, с вашего согласия, рассылки новостей и скидок.</p>
        <h2>Как защищаем</h2>
        <p>Данные передаются по защищённому соединению, хранятся на серверах в России, доступ к ним есть только у сотрудников, которые обрабатывают заказы.</p>
        <h2>Ваши права</h2>
        <p>
          Вы можете запросить сведения о своих данных, их изменение или удаление, а также отозвать согласие, написав на {site.info_email || "наш email"}.
        </p>
        <p>Оператор персональных данных — {site.legal_name}.</p>
      </div>
    </InfoLayout>
  );
}
