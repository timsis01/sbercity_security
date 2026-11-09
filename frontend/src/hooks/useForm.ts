/**
 * Универсальный хук формы: значения, клиентская валидация, отправка и ошибки сервера.
 */
import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiError } from "../api/client";
import { runValidators } from "../lib/validation";
import type { Validator } from "../lib/validation";

/** Значения формы: строки для текстовых полей и флаги для чекбоксов. */
export type FormValues = Record<string, string | boolean>;

/** Набор валидаторов для полей формы. */
export type FormRules<T extends FormValues> = Partial<Record<keyof T, readonly Validator[]>>;

/** Состояние отправки формы. */
export type SubmitStatus = "idle" | "submitting" | "success" | "error";

/** Параметры хука формы. */
export interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  rules?: FormRules<T> | ((values: T) => FormRules<T>);
  onSubmit: (values: T) => Promise<void>;
  consentField?: keyof T;
}

/** Результат хука формы. */
export interface UseFormResult<T extends FormValues> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  formError: string | null;
  status: SubmitStatus;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  bind: (name: keyof T & string) => {
    name: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    error: string | undefined;
  };
  bindCheckbox: (name: keyof T & string) => {
    name: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error: string | undefined;
  };
  handleSubmit: (event?: FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Проверяет все поля формы.
 *
 * @param values Значения.
 * @param rules Правила проверки.
 * @param consentField Поле обязательного согласия на обработку данных.
 * @returns Ошибки по полям.
 */
export function validateValues<T extends FormValues>(
  values: T,
  rules: FormRules<T>,
  consentField?: keyof T,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const validators = rules[key];
    const value = values[key];
    if (validators && typeof value === "string") {
      const error = runValidators(value, validators);
      if (error) {
        errors[key] = error;
      }
    }
  }
  if (consentField && values[consentField] !== true) {
    errors[consentField] = "Необходимо согласие на обработку персональных данных.";
  }
  return errors;
}

/**
 * Управляет состоянием формы.
 *
 * @param options Начальные значения, правила, обработчик отправки и поле согласия.
 * @returns API для привязки полей и отправки.
 */
export function useForm<T extends FormValues>(options: UseFormOptions<T>): UseFormResult<T> {
  const { initialValues, rules, onSubmit, consentField } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }
      return Object.fromEntries(Object.entries(previous).filter(([key]) => key !== name)) as Partial<Record<keyof T, string>>;
    });
  }, []);

  const bind = useCallback(
    (name: keyof T & string) => ({
      name,
      value: String(values[name] ?? ""),
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setValue(name, event.target.value as T[typeof name]),
      error: errors[name],
    }),
    [values, errors, setValue],
  );

  const bindCheckbox = useCallback(
    (name: keyof T & string) => ({
      name,
      checked: values[name] === true,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(name, event.target.checked as T[typeof name]),
      error: errors[name],
    }),
    [values, errors, setValue],
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const activeRules = typeof rules === "function" ? rules(values) : (rules ?? {});
      const clientErrors = validateValues(values, activeRules, consentField);
      setFormError(null);
      if (Object.keys(clientErrors).length > 0) {
        setErrors(clientErrors);
        setStatus("error");
        return;
      }
      setErrors({});
      setStatus("submitting");
      try {
        await onSubmit(values);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        if (error instanceof ApiError) {
          const serverErrors: Partial<Record<keyof T, string>> = {};
          const unknownFieldMessages: string[] = [];
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            if (field in values) {
              serverErrors[field as keyof T] = messages[0];
            } else {
              unknownFieldMessages.push(...messages);
            }
          }
          setErrors(serverErrors);
          const hasFieldErrors = Object.keys(serverErrors).length > 0;
          setFormError(unknownFieldMessages[0] ?? (hasFieldErrors ? "Проверьте правильность заполнения полей." : error.message));
        } else {
          setFormError("Не удалось отправить форму. Попробуйте ещё раз.");
        }
      }
    },
    [values, rules, consentField, onSubmit],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setFormError(null);
    setStatus("idle");
  }, [initialValues]);

  return { values, errors, formError, status, setValue, bind, bindCheckbox, handleSubmit, reset };
}
