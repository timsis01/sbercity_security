/**
 * Контекст авторизации: текущий пользователь, вход, регистрация, выход.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/endpoints";
import type { LoginPayload, ProfilePatch, RegisterPayload, User } from "../api/types";

/** Значение контекста авторизации. */
export interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Определяет текущего пользователя по сессии и предоставляет действия авторизации.
 *
 * @param props Дочерние элементы.
 * @returns Провайдер контекста.
 */
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((data) => {
        if (active) {
          setUser(data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await api.login(payload);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await api.register(payload);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: ProfilePatch) => {
    const data = await api.updateProfile(patch);
    setUser(data);
    return data;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, register, logout, updateProfile }),
    [user, ready, login, register, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Возвращает контекст авторизации.
 *
 * @returns Пользователь и действия авторизации.
 * @throws Error Если хук вызван вне `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return value;
}
