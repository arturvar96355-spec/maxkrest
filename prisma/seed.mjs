import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const db = new PrismaClient();

const defaults = JSON.parse(readFileSync(new URL("./defaults.json", import.meta.url), "utf8"));
const { services } = defaults;
const advantages = defaults.advantages.map((a) => [a.title, a.text]);
const steps = defaults.steps.map((a) => [a.title, a.text]);

async function main() {
  await db.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  // Название утверждено заказчиком: Royal Snow (меняем только прежнее временное значение)
  await db.siteSettings.updateMany({ where: { id: 1, companyName: "Снегоуборка" }, data: { companyName: "Royal Snow", logoText: "Royal Snow" } });
  if ((await db.service.count()) === 0)
    await db.service.createMany({ data: services.map((s, i) => ({ ...s, sort: i })) });
  if ((await db.advantage.count()) === 0)
    await db.advantage.createMany({ data: advantages.map(([title, text], i) => ({ title, text, sort: i })) });
  if ((await db.step.count()) === 0)
    await db.step.createMany({ data: steps.map(([title, text], i) => ({ title, text, sort: i })) });
}

main().finally(() => db.$disconnect());
