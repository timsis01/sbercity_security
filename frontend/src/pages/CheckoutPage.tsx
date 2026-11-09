/**
 * Оформление заказа: контакты получателя, доставка, оплата и подтверждение.
 */
import { useCallback, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/endpoints";
import type { DeliveryMethod, PaymentMethod } from "../api/types";
import { OrderSummary, useQuote } from "../components/cart/OrderSummary";
import { ConsentCheckbox } from "../components/forms/ConsentCheckbox";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Button } from "../components/ui/Button";
import { ChoiceGroup, FormMessage, TextArea, TextField } from "../components/ui/Field";
import type { ChoiceOption } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSite } from "../context/SiteContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useForm } from "../hooks/useForm";
import type { FormRules } from "../hooks/useForm";
import { toPayload } from "../lib/cart";
import { formatPhone, formatPrice } from "../lib/format";
import { email, inn, maskPhone, minLength, phone, required } from "../lib/validation";
import styles from "./CheckoutPage.module.css";

/** Значения формы оформления. */
type CheckoutValues = {
  customer_name: string;
  phone: string;
  email: string;
  company: string;
  inn: string;
  delivery_method: string;
  address: string;
  payment_method: string;
  comment: string;
  consent: boolean;
};

const paymentOptions: readonly ChoiceOption<PaymentMethod>[] = [
  { value: "cash", title: "Наличными", description: "При получении заказа" },
  { value: "card", title: "Картой", description: "Курьеру или в пункте самовывоза" },
  { value: "invoice", title: "По счёту", description: "Для юрлиц: счёт, УПД и накладная" },
];

/**
 * Правила проверки, зависящие от выбранных способов доставки и оплаты.
 *
 * @param values Текущие значения формы.
 * @returns Набор валидаторов.
 */
export function checkoutRules(values: CheckoutValues): FormRules<CheckoutValues> {
  const rules: FormRules<CheckoutValues> = {
    customer_name: [required("Укажите ФИО получателя."), minLength(2, "Слишком короткое имя.")],
    phone: [required("Укажите телефон."), phone],
    email: [required("Укажите email — на него придёт копия заказа."), email],
  };
  if (values.delivery_method === "courier") {
    rules.address = [required("Укажите адрес доставки."), minLength(5, "Адрес слишком короткий.")];
  }
  if (values.payment_method === "invoice") {
    rules.company = [required("Для оплаты по счёту укажите организацию.")];
    rules.inn = [required("Укажите ИНН."), inn];
  }
  return rules;
}

/**
 * Страница оформления заказа.
 *
 * @returns Форма оформления либо перенаправление в пустую корзину.
 */
export function CheckoutPage(): ReactNode {
  useDocumentTitle("Оформление заказа");
  const { lines, promoCode, clear } = useCart();
  const { user } = useAuth();
  const site = useSite();
  const navigate = useNavigate();

  const deliveryOptions = useMemo<readonly ChoiceOption<DeliveryMethod>[]>(
    () => [
      { value: "pickup", title: "Самовывоз", description: "Бесплатно, из офиса в СберСити" },
      { value: "courier", title: "Курьером", description: `${formatPrice(site.delivery_cost)} по Москве, регионы — по договорённости` },
    ],
    [site.delivery_cost],
  );

  const initialValues = useMemo<CheckoutValues>(
    () => ({
      customer_name: user ? `${user.first_name} ${user.last_name}`.trim() : "",
      phone: user?.phone ? formatPhone(user.phone) : "",
      email: user?.email ?? "",
      company: user?.company ?? "",
      inn: "",
      delivery_method: "pickup",
      address: "",
      payment_method: "cash",
      comment: "",
      consent: false,
    }),
    [user],
  );

  const submit = useCallback(
    async (values: CheckoutValues) => {
      const order = await api.createOrder({
        items: toPayload(lines),
        customer_name: values.customer_name.trim(),
        phone: values.phone,
        email: values.email.trim(),
        company: values.company.trim(),
        inn: values.inn.trim(),
        delivery_method: values.delivery_method as DeliveryMethod,
        address: values.address.trim(),
        payment_method: values.payment_method as PaymentMethod,
        comment: values.comment.trim(),
        promo_code: promoCode,
        personal_data_consent: values.consent,
      });
      clear();
      navigate(`/order/${order.number}`, { replace: true, state: { order } });
    },
    [lines, promoCode, clear, navigate],
  );

  const form = useForm<CheckoutValues>({ initialValues, rules: checkoutRules, consentField: "consent", onSubmit: submit });
  const delivery = form.values.delivery_method as DeliveryMethod;
  const quote = useQuote(delivery);
  const { setValue } = form;

  useEffect(() => {
    if (!user) {
      return;
    }
    const prefill: [keyof CheckoutValues, string][] = [
      ["customer_name", `${user.first_name} ${user.last_name}`.trim()],
      ["phone", user.phone ? formatPhone(user.phone) : ""],
      ["email", user.email],
      ["company", user.company],
    ];
    for (const [field, value] of prefill) {
      if (value) {
        setValue(field, value);
      }
    }
  }, [user, setValue]);

  if (lines.length === 0 && form.status !== "submitting" && form.status !== "success") {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "Корзина", to: "/cart" }, { label: "Оформление заказа" }]} />
          <h1 className="h1">Оформление заказа</h1>
        </header>
        <form className={styles.layout} onSubmit={form.handleSubmit} noValidate aria-label="Оформление заказа">
          <div className={styles.sections}>
            <section className={styles.section} aria-labelledby="step-contacts">
              <h2 id="step-contacts" className={styles.step}>
                <span>01</span>Получатель
              </h2>
              <div className={styles.row}>
                <TextField label="ФИО получателя" autoComplete="name" required {...form.bind("customer_name")} />
                <TextField
                  label="Телефон"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                  required
                  {...form.bind("phone")}
                  onChange={(event) => form.setValue("phone", maskPhone(event.target.value))}
                />
              </div>
              <TextField label="Email" type="email" autoComplete="email" required hint="Пришлём копию заказа" {...form.bind("email")} />
            </section>
            <section className={styles.section} aria-labelledby="step-delivery">
              <h2 id="step-delivery" className={styles.step}>
                <span>02</span>Доставка
              </h2>
              <ChoiceGroup name="delivery_method" legend="Способ получения" value={delivery} options={deliveryOptions} onChange={(value) => form.setValue("delivery_method", value)} />
              {delivery === "courier" ? (
                <TextField label="Адрес доставки" autoComplete="street-address" required placeholder="Город, улица, дом, офис" {...form.bind("address")} />
              ) : (
                <p className="muted">Адрес пункта самовывоза: {site.address}. Время работы: {site.working_hours}.</p>
              )}
            </section>
            <section className={styles.section} aria-labelledby="step-payment">
              <h2 id="step-payment" className={styles.step}>
                <span>03</span>Оплата
              </h2>
              <ChoiceGroup
                name="payment_method"
                legend="Способ оплаты"
                value={form.values.payment_method as PaymentMethod}
                options={paymentOptions}
                onChange={(value) => form.setValue("payment_method", value)}
              />
              {form.values.payment_method === "invoice" ? (
                <div className={styles.row}>
                  <TextField label="Организация" autoComplete="organization" required {...form.bind("company")} />
                  <TextField label="ИНН" inputMode="numeric" required {...form.bind("inn")} />
                </div>
              ) : null}
              <TextArea label="Комментарий к заказу" rows={3} {...form.bind("comment")} />
            </section>
            <ConsentCheckbox {...form.bindCheckbox("consent")} />
            <p className={styles.warning}>
              Внимание! Неправильно указанный телефон или неполный адрес могут привести к задержке. Менеджер свяжется с вами для подтверждения заказа.
            </p>
          </div>
          <OrderSummary quote={quote} delivery={delivery}>
            {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
            <Button type="submit" size="lg" block loading={form.status === "submitting"}>
              Подтвердить заказ
            </Button>
          </OrderSummary>
        </form>
      </div>
    </div>
  );
}
