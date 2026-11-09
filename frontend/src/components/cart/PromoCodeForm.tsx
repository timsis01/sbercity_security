/**
 * Ввод и применение промокода.
 */
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ApiError } from "../../api/client";
import { api } from "../../api/endpoints";
import { useCart } from "../../context/CartContext";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import styles from "./PromoCodeForm.module.css";

/**
 * Форма промокода: проверяет код на сервере и сохраняет его в корзине.
 *
 * @returns Форма или информация о применённом коде.
 */
export function PromoCodeForm(): ReactNode {
  const { promoCode, setPromo } = useCart();
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState<boolean>(false);

  if (promoCode) {
    return (
      <div className={styles.applied}>
        <span>
          Промокод <strong>{promoCode}</strong> применён
        </span>
        <Button variant="ghost" onClick={() => setPromo("")}>
          Убрать
        </Button>
      </div>
    );
  }

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!code.trim()) {
      setError("Введите промокод.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const result = await api.validatePromo(code.trim());
      setPromo(result.code);
      setCode("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Не удалось проверить промокод.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-label="Промокод">
      <TextField label="Код скидки" name="promo" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} error={error} placeholder="Например, SBERCITY10" />
      <Button type="submit" variant="outline" loading={busy}>
        Применить
      </Button>
    </form>
  );
}
