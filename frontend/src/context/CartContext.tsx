/**
 * Контекст корзины с сохранением в localStorage и синхронизацией между вкладками.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { ProductListItem } from "../api/types";
import { cartCount, cartReducer, cartSubtotal, emptyCart, parseStoredCart } from "../lib/cart";
import type { CartLine, CartState } from "../lib/cart";
import { readStorage, writeStorage } from "../lib/storage";

/** Ключ хранения корзины в localStorage. */
export const CART_STORAGE_KEY = "sbercity-security-cart";

/** Значение контекста корзины. */
export interface CartContextValue {
  lines: CartLine[];
  promoCode: string;
  count: number;
  subtotal: number;
  add: (product: ProductListItem, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  setPromo: (code: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Восстанавливает корзину из хранилища.
 *
 * @returns Сохранённое состояние или пустая корзина.
 */
function loadCart(): CartState {
  return parseStoredCart(readStorage(CART_STORAGE_KEY));
}

/**
 * Хранит корзину и предоставляет действия над ней.
 *
 * @param props Дочерние элементы.
 * @returns Провайдер контекста.
 */
export function CartProvider({ children }: { children: ReactNode }): ReactNode {
  const [state, dispatch] = useReducer(cartReducer, emptyCart, loadCart);

  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === CART_STORAGE_KEY) {
        dispatch({ type: "replace", state: parseStoredCart(event.newValue) });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((product: ProductListItem, quantity = 1) => dispatch({ type: "add", product, quantity }), []);
  const setQuantity = useCallback((slug: string, quantity: number) => dispatch({ type: "setQuantity", slug, quantity }), []);
  const remove = useCallback((slug: string) => dispatch({ type: "remove", slug }), []);
  const setPromo = useCallback((code: string) => dispatch({ type: "setPromo", code }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      promoCode: state.promoCode,
      count: cartCount(state.lines),
      subtotal: cartSubtotal(state.lines),
      add,
      setQuantity,
      remove,
      setPromo,
      clear,
    }),
    [state, add, setQuantity, remove, setPromo, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Возвращает контекст корзины.
 *
 * @returns Позиции, итоги и действия.
 * @throws Error Если хук вызван вне `CartProvider`.
 */
export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return value;
}
