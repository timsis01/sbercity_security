/**
 * Страница «404 — не найдено».
 */
import type { ReactNode } from "react";
import { ButtonLink } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

/**
 * Сообщает, что страница не существует, и предлагает перейти в каталог.
 *
 * @returns Разметка страницы.
 */
export function NotFoundPage(): ReactNode {
  useDocumentTitle("Страница не найдена");
  return (
    <div className="page">
      <div className="container page-head">
        <span className="eyebrow">Ошибка 404</span>
        <h1 className="display" style={{ marginTop: 16 }}>
          Страница не найдена
        </h1>
        <p className="lead">Возможно, ссылка устарела или в адресе опечатка.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
          <ButtonLink to="/">На главную</ButtonLink>
          <ButtonLink to="/catalog" variant="outline">
            В каталог
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
