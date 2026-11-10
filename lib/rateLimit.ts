import { db } from "@/lib/db";

/** Простой лимит на БД: не более `max` событий за `windowSec` для ключа. */
export async function hit(key: string, max: number, windowSec: number): Promise<boolean> {
  const since = new Date(Date.now() - windowSec * 1000);
  const count = await db.rateLimit.count({ where: { key, createdAt: { gte: since } } });
  if (count >= max) return false;
  await db.rateLimit.create({ data: { key } });
  if (Math.random() < 0.02) await db.rateLimit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86400_000) } } });
  return true;
}

export function clientIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
