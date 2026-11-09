/**
 * Персональный раздел: вход, регистрация, профиль и история заказов.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/endpoints";
import type { User } from "../api/types";
import { OrderDetails } from "../components/cart/OrderDetails";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Button, ButtonLink } from "../components/ui/Button";
import { FormMessage, TextField } from "../components/ui/Field";
import { EmptyState, ErrorState, Loader } from "../components/ui/States";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useForm } from "../hooks/useForm";
import type { FormRules } from "../hooks/useForm";
import { formatDate, formatPhone, formatPrice } from "../lib/format";
import { email, maskPhone, minLength, optionalPhone, required } from "../lib/validation";
import styles from "./AccountPage.module.css";

/** Значения формы входа. */
type LoginValues = { email: string; password: string };

/** Значения формы регистрации. */
type RegisterValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
};

/** Значения формы профиля. */
type ProfileValues = { first_name: string; last_name: string; phone: string; company: string };

const loginRules: FormRules<LoginValues> = {
  email: [required("Укажите email."), email],
  password: [required("Введите пароль.")],
};

const registerRules: FormRules<RegisterValues> = {
  first_name: [required("Укажите имя.")],
  email: [required("Укажите email."), email],
  phone: [optionalPhone],
  password: [required("Придумайте пароль."), minLength(8, "Пароль должен быть не короче 8 символов.")],
};

const profileRules: FormRules<ProfileValues> = {
  first_name: [required("Укажите имя.")],
  phone: [optionalPhone],
};

/**
 * Форма входа.
 *
 * @returns Форма.
 */
function LoginForm(): ReactNode {
  const { login } = useAuth();
  const { notify } = useUi();
  const form = useForm<LoginValues>({
    initialValues: { email: "", password: "" },
    rules: loginRules,
    onSubmit: async (values) => {
      const user = await login({ email: values.email.trim(), password: values.password });
      notify(`Здравствуйте, ${user.first_name || user.email}!`);
    },
  });
  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate aria-label="Вход">
      <TextField label="Email" type="email" autoComplete="email" required {...form.bind("email")} />
      <TextField label="Пароль" type="password" autoComplete="current-password" required {...form.bind("password")} />
      {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" loading={form.status === "submitting"} block>
        Войти
      </Button>
    </form>
  );
}

/**
 * Форма регистрации.
 *
 * @returns Форма.
 */
function RegisterForm(): ReactNode {
  const { register } = useAuth();
  const { notify } = useUi();
  const form = useForm<RegisterValues>({
    initialValues: { first_name: "", last_name: "", email: "", phone: "", company: "", password: "" },
    rules: registerRules,
    onSubmit: async (values) => {
      await register({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone: values.phone,
        company: values.company.trim(),
        password: values.password,
      });
      notify("Регистрация завершена. Добро пожаловать!");
    },
  });
  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate aria-label="Регистрация">
      <div className={styles.row}>
        <TextField label="Имя" autoComplete="given-name" required {...form.bind("first_name")} />
        <TextField label="Фамилия" autoComplete="family-name" {...form.bind("last_name")} />
      </div>
      <TextField label="Email" type="email" autoComplete="email" required {...form.bind("email")} />
      <div className={styles.row}>
        <TextField
          label="Телефон"
          type="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          {...form.bind("phone")}
          onChange={(event) => form.setValue("phone", maskPhone(event.target.value))}
        />
        <TextField label="Организация" autoComplete="organization" {...form.bind("company")} />
      </div>
      <TextField label="Пароль" type="password" autoComplete="new-password" required hint="Не короче 8 символов, не только цифры" {...form.bind("password")} />
      {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" loading={form.status === "submitting"} block>
        Зарегистрироваться
      </Button>
    </form>
  );
}

/**
 * Форма редактирования профиля.
 *
 * @param props Текущий пользователь.
 * @returns Форма.
 */
function ProfileForm({ user }: { user: User }): ReactNode {
  const { updateProfile } = useAuth();
  const { notify } = useUi();
  const form = useForm<ProfileValues>({
    initialValues: { first_name: user.first_name, last_name: user.last_name, phone: user.phone ? formatPhone(user.phone) : "", company: user.company },
    rules: profileRules,
    onSubmit: async (values) => {
      await updateProfile({ first_name: values.first_name.trim(), last_name: values.last_name.trim(), phone: values.phone, company: values.company.trim() });
      notify("Профиль сохранён");
    },
  });
  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate aria-label="Профиль">
      <div className={styles.row}>
        <TextField label="Имя" required {...form.bind("first_name")} />
        <TextField label="Фамилия" {...form.bind("last_name")} />
      </div>
      <div className={styles.row}>
        <TextField label="Телефон" type="tel" {...form.bind("phone")} onChange={(event) => form.setValue("phone", maskPhone(event.target.value))} />
        <TextField label="Организация" {...form.bind("company")} />
      </div>
      <TextField label="Email" name="email" value={user.email} onChange={() => undefined} disabled hint="Email используется для входа и не меняется" />
      {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" variant="dark" loading={form.status === "submitting"}>
        Сохранить
      </Button>
    </form>
  );
}

/**
 * История заказов покупателя.
 *
 * @returns Список заказов.
 */
function OrderHistory(): ReactNode {
  const { data, error, loading, reload } = useAsync(() => api.myOrders(), []);
  const [open, setOpen] = useState<string | null>(null);
  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <ErrorState message={error.message} onRetry={reload} />;
  }
  if (!data || data.results.length === 0) {
    return <EmptyState title="Заказов пока нет" text="Оформленные заказы появятся здесь." action={<ButtonLink to="/catalog">В каталог</ButtonLink>} />;
  }
  return (
    <ul className={styles.orders}>
      {data.results.map((order) => (
        <li key={order.number} className={styles.order}>
          <button type="button" className={styles.orderHead} aria-expanded={open === order.number} onClick={() => setOpen(open === order.number ? null : order.number)}>
            <span className={styles.orderNumber}>{order.number}</span>
            <span className="muted">{formatDate(order.created_at)}</span>
            <span className={styles.status}>{order.status_display}</span>
            <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
          </button>
          {open === order.number ? (
            <div className={styles.orderBody}>
              <OrderDetails order={order} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Страница личного кабинета.
 *
 * @returns Разметка кабинета.
 */
export function AccountPage(): ReactNode {
  const { user, ready, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  useDocumentTitle(user ? "Личный кабинет" : "Вход");

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <Breadcrumbs items={[{ label: "Персональный раздел" }]} />
          <h1 className="h1">{user ? `Здравствуйте, ${user.first_name || "покупатель"}` : "Персональный раздел"}</h1>
        </header>
        {!ready ? <Loader /> : null}
        {ready && !user ? (
          <div className={styles.auth}>
            <div className={styles.tabs} role="tablist" aria-label="Вход или регистрация">
              <button type="button" role="tab" aria-selected={mode === "login"} className={styles.tab} onClick={() => setMode("login")}>
                Вход
              </button>
              <button type="button" role="tab" aria-selected={mode === "register"} className={styles.tab} onClick={() => setMode("register")}>
                Регистрация
              </button>
            </div>
            <div role="tabpanel">{mode === "login" ? <LoginForm /> : <RegisterForm />}</div>
            <p className="muted">Покупать можно и без регистрации — в кабинете удобно отслеживать историю заказов.</p>
          </div>
        ) : null}
        {ready && user ? (
          <div className={styles.cabinet}>
            <section aria-labelledby="orders-title">
              <h2 id="orders-title" className={styles.sectionTitle}>
                Мои заказы
              </h2>
              <OrderHistory />
            </section>
            <aside className={styles.profile} aria-labelledby="profile-title">
              <h2 id="profile-title" className={styles.sectionTitle}>
                Профиль
              </h2>
              <ProfileForm key={user.id} user={user} />
              <Button variant="outline" onClick={() => void logout()}>
                Выйти
              </Button>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
