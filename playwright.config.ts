import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const chromium = process.env.PW_CHROMIUM ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "off",
    launchOptions: chromium ? { executablePath: chromium } : {},
  },
  projects: [{ name: "mobile", use: { viewport: { width: 390, height: 844 } } }],
});
