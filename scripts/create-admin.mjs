import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
if (!email || password.length < 10) {
  console.log("ADMIN_EMAIL/ADMIN_PASSWORD (≥10 символов) не заданы — создание администратора пропущено");
  await db.$disconnect();
  process.exit(0);
}
const passwordHash = await bcrypt.hash(password, 12);
await db.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
console.log("Администратор создан/обновлён:", email);
await db.$disconnect();
