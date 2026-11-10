import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Клиент создаётся лениво — при первом обращении к БД. Так страницы в демо-режиме
 * (без DATABASE_URL) вообще не трогают Prisma.
 */
function client(): PrismaClient {
  return (g.prisma ??= new PrismaClient());
}

export const db = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    const c = client();
    const v = (c as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
});
