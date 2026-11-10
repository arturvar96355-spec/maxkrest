// Сборка на Vercel: если задан DATABASE_URL — применяем миграции, наполняем контент и создаём администратора.
import { execSync } from "node:child_process";

const run = (c) => execSync(c, { stdio: "inherit", env: process.env });

run("npx prisma generate");
if (process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
  run("node prisma/seed.mjs");
  run("node scripts/create-admin.mjs");
} else {
  console.warn("[vercel-build] DATABASE_URL не задан — миграции пропущены (сайт не будет работать без БД)");
}
run("npx next build");
