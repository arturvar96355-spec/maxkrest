import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Доступна ли база и применены ли миграции. Проверяется пробным запросом (раз за запрос).
 * Если нет — публичные страницы работают в демо-режиме, а не падают с ошибкой сервера.
 */
export const dbReady = cache(async (): Promise<boolean> => {
  if (!process.env.DATABASE_URL) return false;
  try {
    await db.siteSettings.findFirst({ select: { id: true } });
    return true;
  } catch (e) {
    console.error("[db] база недоступна или не мигрирована — демо-режим:", e);
    return false;
  }
});

export const isDemo = async () => !(await dbReady());
