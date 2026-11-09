/**
 * Форма подписки на новости и скидки.
 */
import type { ReactNode } from "react";
import { api } from "../../api/endpoints";
import { useForm } from "../../hooks/useForm";
import type { FormRules } from "../../hooks/useForm";
import { email, required } from "../../lib/validation";
import { Button } from "../ui/Button";
import { FormMessage, TextField } from "../ui/Field";
import styles from "./Forms.module.css";

/** Значения формы подписки. */
type SubscribeValues = { email: string };

const rules: FormRules<SubscribeValues> = { email: [required("Укажите email."), email] };

/**
 * Поле email с кнопкой подписки.
 *
 * @returns Форма или подтверждение подписки.
 */
export function SubscribeForm(): ReactNode {
  const form = useForm<SubscribeValues>({
    initialValues: { email: "" },
    rules,
    onSubmit: async (values) => {
      await api.subscribe(values.email.trim());
    },
  });

  if (form.status === "success") {
    return <FormMessage tone="success">Готово! Будем присылать новости и персональные скидки на {form.values.email}.</FormMessage>;
  }

  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate aria-label="Подписка на скидки">
      <div className={styles.inline}>
        <TextField label="Email для скидок" type="email" autoComplete="email" placeholder="you@company.ru" {...form.bind("email")} />
      </div>
      {form.formError && !form.errors.email ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" variant="dark" loading={form.status === "submitting"}>
        Подписаться
      </Button>
    </form>
  );
}
