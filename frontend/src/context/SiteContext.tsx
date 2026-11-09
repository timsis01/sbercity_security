/**
 * Контекст сведений о компании: телефоны, адрес, email, стоимость доставки.
 */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/endpoints";
import type { SiteInfo } from "../api/types";

/** Значения по умолчанию, пока данные не загружены с сервера. */
export const defaultSiteInfo: SiteInfo = {
  company_name: "СберСити — безопасность",
  legal_name: "ООО «СберСити — безопасность»",
  inn: "",
  phones: [],
  sales_email: "",
  info_email: "",
  address: "",
  working_hours: "ПН-ВС 9:00–19:00",
  office_hours: "ПН-ПТ 10:00–19:00",
  telegram: "",
  delivery_cost: 2500,
};

const SiteContext = createContext<SiteInfo>(defaultSiteInfo);

/** Свойства провайдера сведений о компании. */
interface SiteProviderProps {
  children: ReactNode;
  initial?: SiteInfo;
}

/**
 * Загружает сведения о компании и предоставляет их дочерним компонентам.
 *
 * @param props Дочерние элементы и необязательные начальные данные (для тестов).
 * @returns Провайдер контекста.
 */
export function SiteProvider({ children, initial }: SiteProviderProps): ReactNode {
  const [info, setInfo] = useState<SiteInfo>(initial ?? defaultSiteInfo);

  useEffect(() => {
    if (initial) {
      return;
    }
    let active = true;
    api
      .site()
      .then((data) => {
        if (active) {
          setInfo(data);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initial]);

  return <SiteContext.Provider value={info}>{children}</SiteContext.Provider>;
}

/**
 * Возвращает сведения о компании.
 *
 * @returns Данные компании.
 */
export function useSite(): SiteInfo {
  return useContext(SiteContext);
}
