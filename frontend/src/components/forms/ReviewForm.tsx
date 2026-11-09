/**
 * Форма отзыва о магазине с оценкой от 1 до 5.
 */
import type { ReactNode } from "react";
import { api } from "../../api/endpoints";
import { useForm } from "../../hooks/useForm";
import type { FormRules } from "../../hooks/useForm";
import { minLength, required } from "../../lib/validation";
import { Button } from "../ui/Button";
import { FormMessage, TextArea, TextField } from "../ui/Field";
import { Icon } from "../ui/Icon";
import styles from "./Forms.module.css";

/** Значения формы отзыва. */
type ReviewValues = {
  author_name: string;
  rating: string;
  text: string;
};

const rules: FormRules<ReviewValues> = {
  author_name: [required("Укажите имя."), minLength(2, "Имя слишком короткое.")],
  rating: [required("Поставьте оценку.")],
  text: [required("Напишите отзыв."), minLength(10, "Отзыв должен быть не короче 10 символов.")],
};

const RATINGS: readonly number[] = [1, 2, 3, 4, 5];

/**
 * Форма отзыва; отзыв публикуется после модерации.
 *
 * @returns Форма или подтверждение отправки.
 */
export function ReviewForm(): ReactNode {
  const form = useForm<ReviewValues>({
    initialValues: { author_name: "", rating: "5", text: "" },
    rules,
    onSubmit: async (values) => {
      await api.sendReview({ author_name: values.author_name.trim(), rating: Number(values.rating), text: values.text.trim() });
    },
  });

  if (form.status === "success") {
    return <FormMessage tone="success">Спасибо за отзыв! Он появится на сайте после проверки модератором.</FormMessage>;
  }

  const current = Number(form.values.rating);
  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate aria-label="Форма отзыва">
      <TextField label="Ваше имя" autoComplete="name" required {...form.bind("author_name")} />
      <fieldset className={styles.stars}>
        <legend>Оценка</legend>
        {RATINGS.map((value) => (
          <label key={value} className={`${styles.star} ${value <= current ? styles.starActive : ""}`}>
            <input
              type="radio"
              name="rating"
              value={value}
              checked={current === value}
              onChange={() => form.setValue("rating", String(value))}
              aria-label={`${value} из 5`}
            />
            <Icon name="star" size={20} filled={value <= current} />
          </label>
        ))}
      </fieldset>
      <TextArea label="Отзыв" rows={4} required {...form.bind("text")} />
      {form.formError ? <FormMessage tone="error">{form.formError}</FormMessage> : null}
      <Button type="submit" variant="dark" loading={form.status === "submitting"}>
        Оставить отзыв
      </Button>
    </form>
  );
}
