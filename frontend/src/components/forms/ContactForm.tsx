/**
 * Форма «Отправить сообщение» на странице контактов.
 */
import type { ReactNode } from "react";
import { api } from "../../api/endpoints";
import { useForm } from "../../hooks/useForm";
import type { FormRules } from "../../hooks/useForm";
import { email, maskPhone, minLength, optionalPhone, required } from "../../lib/validation";
import { Button } from "../ui/Button";
import { FormMessage, TextArea, TextField } from "../ui/Field";
import { ConsentCheckbox } from "./ConsentCheckbox";
import styles from "./Forms.module.css";

/** Значения формы сообщения. */
type ContactValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const rules: FormRules<ContactValues> = {
  name: [required("Укажите имя."), minLength(2, "Имя слишком короткое.")],
  email: [required("Укажите email."), email],
  phone: [optionalPhone],
  message: [required("Напишите сообщение."), minLength(10, "Сообщение должно быть не короче 10 символов.")],
};

/**
 * Форма обратной связи с email, необязательным телефоном и текстом.
 *
 * @returns Форма или сообщение об успешной отправке.
 */
export function ContactForm(): ReactNode {
  const form = useForm<ContactValues>({
    initialValues: { name: "", email: "", phone: "", message: "", consent: false },
    rules,
    consentField: "consent",
    onSubmit: async (values) => {
      await api.sendContact({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone,
        message: values.message.trim(),
        personal_data_consent: values.consent,
      });
    },
  });

  if (form.status === "success") {
    return (
      <div className={styles.form}>
        <FormMessage tone="success">Сообщение отправлено. Спасибо, что поделились — мы ответим на указанный email.</FormMessage>
        <Button variant="outline" onClick={form.reset}>
          Написать ещё
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate aria-label="Форма обратной связи">
      <div className={styles.row}>
        <TextField label="Имя" autoComplete="name" required {...form.bind("name")} />
        <TextField label="Email" type="email" autoComplete="email" required {...form.bind("email")} />
      </div>
      <TextField
        label="Телефон"
        type="tel"
        autoComplete="tel"
        placeholder="+7 (___) ___-__-__"
        {...form.bind("phone")}
        onChange={(event) => form.setValue("phone", maskPhone(event.target.value))}
      />
      <TextArea label="Сообщение" rows={5} required {...form.bind("message")} placeholder="Идеи, пожелания или замечания по работе магазина" />
      <ConsentCheckbox {...form.bindCheckbox("consent")} />
      {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" loading={form.status === "submitting"}>
        <span>Отправить сообщение</span>
      </Button>
    </form>
  );
}
