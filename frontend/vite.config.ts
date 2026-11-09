/**
 * Конфигурация сборки Vite и модульных тестов Vitest.
 *
 * В режиме разработки запросы к API, админке и медиа проксируются на Django,
 * поэтому фронтенд и бэкенд работают с одного origin и сессионные cookie
 * ведут себя так же, как за nginx в Docker.
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const backendUrl: string = process.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

const proxiedPrefixes: readonly string[] = ["/api", "/admin", "/django-static", "/media"];

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(proxiedPrefixes.map((prefix) => [prefix, { target: backendUrl, changeOrigin: false }])),
  },
  preview: {
    port: 4173,
    proxy: Object.fromEntries(proxiedPrefixes.map((prefix) => [prefix, { target: backendUrl, changeOrigin: false }])),
  },
  build: {
    sourcemap: false,
    target: "es2022",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: { modules: { classNameStrategy: "non-scoped" } },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/main.tsx", "src/vite-env.d.ts"],
      reporter: ["text-summary", "text"],
    },
  },
});
