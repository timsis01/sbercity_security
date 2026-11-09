/**
 * Кнопка и ссылка-кнопка в стиле СберСити: прямые углы, заглавные буквы.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import styles from "./Button.module.css";

/** Визуальный вариант кнопки. */
export type ButtonVariant = "primary" | "dark" | "outline" | "light" | "ghost";

/** Размер кнопки. */
export type ButtonSize = "md" | "sm" | "lg";

/** Общие свойства оформления. */
interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

/**
 * Собирает классы кнопки.
 *
 * @param props Вариант, размер и растягивание на всю ширину.
 * @param extra Дополнительный класс.
 * @returns Строка классов.
 */
function buttonClass({ variant = "primary", size = "md", block = false }: StyleProps, extra?: string): string {
  return [styles.button, styles[variant], styles[size], block ? styles.block : "", extra ?? ""].filter(Boolean).join(" ");
}

/** Свойства кнопки. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  loading?: boolean;
}

/**
 * Кнопка с состоянием загрузки.
 *
 * @param props Оформление, флаг загрузки и стандартные свойства кнопки.
 * @returns Элемент кнопки.
 */
export function Button({ variant, size, block, loading = false, className, children, disabled, type = "button", ...rest }: ButtonProps): ReactNode {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

/** Свойства ссылки-кнопки. */
export interface ButtonLinkProps extends LinkProps, StyleProps {}

/**
 * Ссылка внутри приложения, оформленная как кнопка.
 *
 * @param props Оформление и свойства ссылки роутера.
 * @returns Элемент ссылки.
 */
export function ButtonLink({ variant, size, block, className, children, ...rest }: ButtonLinkProps): ReactNode {
  return (
    <Link className={buttonClass({ variant, size, block }, className)} {...rest}>
      <span className={styles.label}>{children}</span>
    </Link>
  );
}
