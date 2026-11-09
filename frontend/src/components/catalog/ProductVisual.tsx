/**
 * Иллюстрация товара: загруженное фото либо линейный рисунок по категории.
 */
import type { ReactNode } from "react";
import { ProductRender, hasRender } from "./ProductRender";
import styles from "./ProductVisual.module.css";

/** Мотив рисунка. */
type Motif = "camera" | "register" | "face" | "document" | "chart" | "hardware" | "flame" | "extinguisher" | "education" | "service" | "game";

const motifByCategory: Record<string, Motif> = {
  videosapiens: "camera",
  osnovnoe: "camera",
  "kontrol-kassovyh-operaciy": "register",
  "raspoznavanie-lic": "face",
  "elektronnye-akty": "document",
  "verhniy-uroven": "chart",
  oborudovanie: "hardware",
  "pozharnaya-bezopasnost": "flame",
  "avtonomnoe-pozharotushenie": "flame",
  ognetushiteli: "extinguisher",
  obuchenie: "education",
  uslugi: "service",
  razvlecheniya: "game",
};

const drawings: Record<Motif, ReactNode> = {
  camera: (
    <>
      <path d="M44 70h70l22-14v48l-22-14H44z" />
      <rect x="44" y="62" width="70" height="36" />
      <circle className={styles.accent} cx="70" cy="80" r="9" />
      <path d="M60 98v22h-16M128 40a40 40 0 0 1 0 0" />
      <path className={styles.accent} d="M140 46c10 8 16 20 16 34M150 36c14 11 22 27 22 44" />
    </>
  ),
  register: (
    <>
      <rect x="50" y="50" width="100" height="70" />
      <rect x="62" y="62" width="76" height="22" />
      <path d="M62 96h12M84 96h12M106 96h12M62 108h12M84 108h12M106 108h12" />
      <path d="M40 120h120" />
      <circle className={styles.accent} cx="150" cy="42" r="8" />
      <path className={styles.accent} d="M150 50v8" />
    </>
  ),
  face: (
    <>
      <path d="M58 46H46v12M142 46h12v12M58 134H46v-12M142 134h12v-12" />
      <ellipse cx="100" cy="88" rx="26" ry="32" />
      <path d="M90 82h0M110 82h0" strokeWidth="4" />
      <path d="M90 102c6 5 14 5 20 0" />
      <path className={styles.accent} d="M40 90h120" />
    </>
  ),
  document: (
    <>
      <path d="M64 36h52l20 20v88H64z" />
      <path d="M116 36v20h20M78 74h44M78 88h44M78 102h28" />
      <path className={styles.accent} d="M96 124l8 8 18-18" />
    </>
  ),
  chart: (
    <>
      <path d="M44 132h112M44 132V44" />
      <rect x="58" y="96" width="16" height="36" />
      <rect x="86" y="76" width="16" height="56" />
      <rect x="114" y="60" width="16" height="72" />
      <path className={styles.accent} d="M60 80l28-20 28 8 30-26" />
    </>
  ),
  hardware: (
    <>
      <rect x="52" y="44" width="96" height="26" />
      <rect x="52" y="76" width="96" height="26" />
      <rect x="52" y="108" width="96" height="26" />
      <path d="M64 57h28M64 89h28M64 121h28" />
      <circle className={styles.accent} cx="132" cy="57" r="4" />
      <circle className={styles.accent} cx="132" cy="89" r="4" />
      <circle cx="132" cy="121" r="4" />
    </>
  ),
  flame: (
    <>
      <path d="M100 36 140 52v30c0 28-17 44-40 52-23-8-40-24-40-52V52z" />
      <path className={styles.accent} d="M100 64c10 12 18 20 18 32a18 18 0 0 1-36 0c0-8 4-14 10-20 0 8 4 12 8 12 0-10-4-16 0-24z" />
    </>
  ),
  extinguisher: (
    <>
      <rect x="82" y="64" width="36" height="78" rx="0" />
      <path d="M90 64V52h20v12M110 52h20l8 10M100 52v-8" />
      <path className={styles.accent} d="M82 92h36M82 104h36" />
    </>
  ),
  education: (
    <>
      <path d="M40 74l60-26 60 26-60 26z" />
      <path d="M66 86v26c18 12 50 12 68 0V86" />
      <path className={styles.accent} d="M160 74v34" />
      <circle className={styles.accent} cx="160" cy="112" r="4" />
    </>
  ),
  service: (
    <>
      <circle cx="100" cy="88" r="20" />
      <path d="M100 48v14M100 114v14M60 88h14M126 88h14M72 60l10 10M118 106l10 10M72 116l10-10M118 70l10-10" />
      <circle className={styles.accent} cx="100" cy="88" r="6" />
    </>
  ),
  game: (
    <>
      <rect x="56" y="56" width="64" height="64" />
      <rect x="92" y="40" width="52" height="52" />
      <circle cx="74" cy="74" r="3" />
      <circle cx="102" cy="102" r="3" />
      <circle cx="88" cy="88" r="3" />
      <circle className={styles.accent} cx="118" cy="66" r="4" />
    </>
  ),
};

/** Свойства иллюстрации товара. */
interface ProductVisualProps {
  categorySlug: string;
  visual?: string | null;
  image?: string | null;
  title: string;
  size?: "card" | "large";
}

/**
 * Показывает фото товара, его объёмную модель или — запасной вариант — рисунок категории.
 *
 * @param props Слаг категории, ключ модели, URL фото, название и размер.
 * @returns Блок изображения.
 */
export function ProductVisual({ categorySlug, visual, image, title, size = "card" }: ProductVisualProps): ReactNode {
  const motif = motifByCategory[categorySlug] ?? "camera";
  const rendered = !image && hasRender(visual);
  return (
    <div className={`${styles.visual} ${size === "large" ? styles.large : ""} ${rendered ? styles.studio : ""}`}>
      {image ? (
        <img src={image} alt={title} className={styles.photo} loading="lazy" />
      ) : rendered && visual ? (
        <ProductRender visual={visual} title={title} className={styles.render} />
      ) : (
        <svg viewBox="0 0 200 180" className={styles.drawing} role="img" aria-label={title} data-motif={motif}>
          {drawings[motif]}
        </svg>
      )}
    </div>
  );
}
