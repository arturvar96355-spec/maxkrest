import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: { exclude: ["tests/e2e/**", "node_modules/**"], include: ["tests/**/*.test.ts"] },
});
