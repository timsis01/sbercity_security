/**
 * Тесты объёмных моделей товаров: каждая модель из справочника бэкенда отрисовывается.
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductRender, hasRender } from "./ProductRender";
import { ProductVisual } from "./ProductVisual";

const BACKEND_VISUALS: readonly string[] = [
  "dome-camera",
  "bullet-camera",
  "server",
  "monitor-grid",
  "monitor-settings",
  "monitor-filmstrip",
  "monitor-map",
  "monitor-dashboard",
  "monitor-pos",
  "monitor-faces",
  "kiosk-lamp",
  "pos-register",
  "hand-wash",
  "face-terminal",
  "face-repeat",
  "face-clock",
  "face-search",
  "face-database",
  "e-acts",
  "smart-lock",
  "camera-mast",
  "mobile-tower",
  "relay-4",
  "relay-8",
  "relay-16",
  "usb-key",
  "board-game",
  "certificate",
  "service-kit",
  "fire-cable",
  "fire-socket",
  "fire-panel",
  "aerosol-generator",
  "hand-extinguisher",
];

describe("ProductRender", () => {
  it.each(BACKEND_VISUALS)("модель %s отрисовывается с подписью", (visual) => {
    expect(hasRender(visual)).toBe(true);
    const { container } = render(<ProductRender visual={visual} title="Товар" />);
    const svg = container.querySelector(`svg[data-visual="${visual}"]`);
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-label", "Товар");
    expect(svg?.querySelectorAll("linearGradient, radialGradient").length).toBeGreaterThan(0);
  });

  it("у разных экземпляров на странице не пересекаются id градиентов", () => {
    const { container } = render(
      <>
        <ProductRender visual="usb-key" title="A" />
        <ProductRender visual="usb-key" title="B" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("неизвестная модель не рисуется", () => {
    expect(hasRender("unknown")).toBe(false);
    expect(hasRender("")).toBe(false);
    const { container } = render(<ProductRender visual="unknown" title="X" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ProductVisual", () => {
  it("предпочитает фото, затем модель, затем рисунок категории", () => {
    const photo = render(<ProductVisual categorySlug="oborudovanie" visual="usb-key" image="/media/x.jpg" title="Фото" />);
    expect(photo.container.querySelector("img")).toHaveAttribute("src", "/media/x.jpg");
    const model = render(<ProductVisual categorySlug="oborudovanie" visual="usb-key" title="Модель" />);
    expect(model.container.querySelector('svg[data-visual="usb-key"]')).not.toBeNull();
    const fallback = render(<ProductVisual categorySlug="ognetushiteli" visual="" title="Рисунок" />);
    expect(fallback.container.querySelector('svg[data-motif="extinguisher"]')).not.toBeNull();
  });
});
