/**
 * Поле количества с кнопками «−» и «+».
 */
import type { ReactNode } from "react";
import { MAX_QUANTITY, clampQuantity } from "../../lib/cart";
import { Icon } from "../ui/Icon";
import styles from "./QuantityInput.module.css";

/** Свойства поля количества. */
interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

/**
 * Позволяет изменить количество в диапазоне от 1 до максимума.
 *
 * @param props Текущее значение, обработчик и доступная подпись.
 * @returns Группа элементов управления.
 */
export function QuantityInput({ value, onChange, label }: QuantityInputProps): ReactNode {
  return (
    <div className={styles.wrap} role="group" aria-label={label}>
      <button type="button" className={styles.step} onClick={() => onChange(clampQuantity(value - 1))} disabled={value <= 1} aria-label="Уменьшить количество">
        <Icon name="minus" size={16} />
      </button>
      <input
        className={styles.input}
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QUANTITY}
        value={value}
        aria-label="Количество"
        onChange={(event) => onChange(clampQuantity(Number(event.target.value)))}
      />
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(clampQuantity(value + 1))}
        disabled={value >= MAX_QUANTITY}
        aria-label="Увеличить количество"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
