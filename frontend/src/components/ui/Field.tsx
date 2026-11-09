/**
 * Поля форм с подписью, подсказкой и сообщением об ошибке.
 */
import { useId } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

/** Общие свойства обёртки поля. */
interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/** Свойства текстового поля. */
export interface TextFieldProps extends FieldShellProps, Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Однострочное текстовое поле.
 *
 * @param props Подпись, ошибка, подсказка и свойства input.
 * @returns Поле с подписью.
 */
export function TextField({ label, error, hint, required, id, className, ...rest }: TextFieldProps): ReactNode {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ""} ${className ?? ""}`}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
      </label>
      <input id={fieldId} className={styles.control} aria-invalid={error ? true : undefined} aria-describedby={describedBy} required={required} {...rest} />
      {error ? (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** Свойства многострочного поля. */
export interface TextAreaProps extends FieldShellProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * Многострочное текстовое поле.
 *
 * @param props Подпись, ошибка, подсказка и свойства textarea.
 * @returns Поле с подписью.
 */
export function TextArea({ label, error, hint, required, id, className, rows = 4, ...rest }: TextAreaProps): ReactNode {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ""} ${className ?? ""}`}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className={`${styles.control} ${styles.textarea}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        required={required}
        {...rest}
      />
      {error ? (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}

/** Свойства чекбокса. */
export interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  children: ReactNode;
}

/**
 * Чекбокс с произвольной подписью.
 *
 * @param props Состояние, обработчик, ошибка и подпись.
 * @returns Чекбокс.
 */
export function Checkbox({ name, checked, onChange, error, children }: CheckboxProps): ReactNode {
  const id = useId();
  return (
    <div className={`${styles.checkboxWrap} ${error ? styles.invalid : ""}`}>
      <label className={styles.checkbox} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span className={styles.box} aria-hidden="true" />
        <span className={styles.checkboxText}>{children}</span>
      </label>
      {error ? (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** Вариант выбора в группе карточек. */
export interface ChoiceOption<T extends string> {
  value: T;
  title: string;
  description?: string;
}

/** Свойства группы выбора. */
export interface ChoiceGroupProps<T extends string> {
  name: string;
  legend: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
}

/**
 * Группа радиокнопок в виде карточек.
 *
 * @param props Название группы, текущее значение, варианты и обработчик.
 * @returns Набор полей.
 */
export function ChoiceGroup<T extends string>({ name, legend, value, options, onChange }: ChoiceGroupProps<T>): ReactNode {
  return (
    <fieldset className={styles.choices}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.choiceGrid}>
        {options.map((option) => (
          <label key={option.value} className={`${styles.choice} ${value === option.value ? styles.choiceActive : ""}`}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span className={styles.choiceTitle}>{option.title}</span>
            {option.description ? <span className={styles.choiceDescription}>{option.description}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Блок общего сообщения формы об ошибке или успехе.
 *
 * @param props Тон и текст сообщения.
 * @returns Сообщение с ролью для экранных дикторов.
 */
export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }): ReactNode {
  return (
    <div className={`${styles.message} ${tone === "error" ? styles.messageError : styles.messageSuccess}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
