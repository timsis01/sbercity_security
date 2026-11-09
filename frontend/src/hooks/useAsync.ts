/**
 * Хук загрузки данных с отслеживанием состояния и отменой устаревших запросов.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";

/** Состояние асинхронной загрузки. */
export interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Загружает данные при монтировании и при изменении зависимостей.
 * Ответ устаревшего запроса игнорируется, если зависимости успели смениться.
 *
 * @param loader Функция, возвращающая промис с данными.
 * @param deps Примитивные зависимости, при изменении которых загрузка повторяется.
 * @returns Данные, ошибка, флаг загрузки и функция повтора.
 */
export function useAsync<T>(loader: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [attempt, setAttempt] = useState<number>(0);
  const loaderRef = useRef(loader);
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    loaderRef
      .current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(reason instanceof ApiError ? reason : new ApiError(0, "Не удалось загрузить данные."));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [depsKey, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { data, error, loading, reload };
}
