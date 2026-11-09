/**
 * Конфигурация сквозных тестов Playwright.
 *
 * По умолчанию поднимает Django на отдельной SQLite-базе и собранный фронтенд в режиме preview.
 * Для проверки Docker-стенда задайте `E2E_BASE_URL=http://localhost:8080` — серверы не запускаются.
 * `E2E_CHANNEL=msedge` или `chrome` использует установленный браузер вместо скачиваемого Chromium.
 */
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const externalBaseUrl: string | undefined = process.env.E2E_BASE_URL;
const baseURL: string = externalBaseUrl ?? "http://127.0.0.1:4173";
const backendDir: string = path.resolve(import.meta.dirname, "..", "backend");
const python: string = process.platform === "win32" ? path.join(backendDir, ".venv", "Scripts", "python.exe") : path.join(backendDir, ".venv", "bin", "python");
const sqlitePath: string = path.join(backendDir, "e2e.sqlite3");

const backendEnv: Record<string, string> = {
  DJANGO_DEBUG: "1",
  SQLITE_PATH: sqlitePath,
  FORMS_THROTTLE_RATE: "1000/hour",
  DJANGO_ALLOWED_HOSTS: "127.0.0.1,localhost",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "ru-RU",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    channel: process.env.E2E_CHANNEL,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.E2E_CHANNEL } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.E2E_CHANNEL }, testMatch: /navigation\.spec\.ts/ },
  ],
  webServer: externalBaseUrl
    ? undefined
    : [
        {
          command: `"${python}" -c "import os,sys;p=sys.argv[1];os.path.exists(p) and os.remove(p)" "${sqlitePath}" && "${python}" manage.py migrate --noinput && "${python}" manage.py seed_demo && "${python}" manage.py runserver 127.0.0.1:8000 --noreload`,
          cwd: backendDir,
          url: "http://127.0.0.1:8000/api/health/",
          env: backendEnv,
          reuseExistingServer: false,
          timeout: 120_000,
        },
        {
          command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
          url: "http://127.0.0.1:4173",
          reuseExistingServer: false,
          timeout: 180_000,
        },
      ],
});
