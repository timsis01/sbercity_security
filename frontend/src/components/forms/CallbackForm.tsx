/**
 * Форма заявки: обратный звонок, запрос цены, быстрый заказ или консультация.
 */
import { useCallback } from "react";
import type { ReactNode } from "react";
import { api } from "../../api/endpoints";
import type { CallbackTopic } from "../../api/types";
import { useForm } from "../../hooks/useForm";
import type { FormRules } from "../../hooks/useForm";
import { maskPhone, minLength, phone, required } from "../../lib/validation";
import { Button } from "../ui/Button";
import { FormMessage, TextArea, TextField } from "../ui/Field";
import { ConsentCheckbox } from "./ConsentCheckbox";
import styles from "./Forms.module.css";

/** Значения формы заявки. */
type CallbackValues = {
  name: string;
  phone: string;
  comment: string;
  consent: boolean;
};

const rules: FormRules<CallbackValues> = {
  name: [required("Укажите имя."), minLength(2, "Имя слишком короткое.")],
  phone: [required("Укажите телефон."), phone],
};

/** Свойства формы заявки. */
interface CallbackFormProps {
  topic: CallbackTopic;
  productSlug?: string | null;
  submitLabel?: string;
  tone?: "light" | "dark";
  onSuccess?: () => void;
}

/**
 * Форма заявки с маской телефона и обязательным согласием.
 *
 * @param props Тема заявки, товар, текст кнопки, цветовая схема и обработчик успеха.
 * @returns Форма или сообщение об успешной отправке.
 */
export function CallbackForm({ topic, productSlug = null, submitLabel = "Отправить заявку", tone = "light", onSuccess }: CallbackFormProps): ReactNode {
  const submit = useCallback(
    async (values: CallbackValues) => {
      await api.sendCallback({
        topic,
        name: values.name.trim(),
        phone: values.phone,
        comment: values.comment.trim(),
        product: productSlug,
        personal_data_consent: values.consent,
      });
      onSuccess?.();
    },
    [topic, productSlug, onSuccess],
  );

  const form = useForm<CallbackValues>({
    initialValues: { name: "", phone: "", comment: "", consent: false },
    rules,
    consentField: "consent",
    onSubmit: submit,
  });

  if (form.status === "success") {
    return (
      <FormMessage tone="success">
        Спасибо! Заявка принята — менеджер перезвонит в рабочее время.
      </FormMessage>
    );
  }

  const phoneBinding = form.bind("phone");
  return (
    <form className={`${styles.form} ${tone === "dark" ? styles.dark : ""}`} onSubmit={form.handleSubmit} noValidate aria-label="Форма заявки">
      <div className={styles.row}>
        <TextField label="Имя" autoComplete="name" required {...form.bind("name")} />
        <TextField
          label="Телефон"
          type="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          required
          {...phoneBinding}
          onChange={(event) => form.setValue("phone", maskPhone(event.target.value))}
        />
      </div>
      <TextArea label="Комментарий" rows={3} {...form.bind("comment")} placeholder="Опишите задачу или удобное время для звонка" />
      <ConsentCheckbox {...form.bindCheckbox("consent")} />
      {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" loading={form.status === "submitting"} block>
        {submitLabel}
      </Button>
    </form>
  );
}
