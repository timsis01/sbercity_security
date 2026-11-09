/**
 * Чекбокс согласия на обработку персональных данных.
 */
import type { ChangeEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "../ui/Field";

/** Свойства чекбокса согласия. */
interface ConsentCheckboxProps {
  name: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

/**
 * Отрисовывает обязательное согласие со ссылкой на политику.
 *
 * @param props Состояние и обработчик чекбокса.
 * @returns Чекбокс.
 */
export function ConsentCheckbox(props: ConsentCheckboxProps): ReactNode {
  return (
    <Checkbox {...props}>
      Я соглашаюсь на обработку персональных данных в соответствии с{" "}
      <Link to="/privacy" target="_blank" rel="noopener">
        политикой конфиденциальности
      </Link>
    </Checkbox>
  );
}
