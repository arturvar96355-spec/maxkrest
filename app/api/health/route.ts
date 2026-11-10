import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Проверка живости. При сбое возвращает безопасную диагностику (без значений секретов). */
export async function GET() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_SECRET: !!process.env.AUTH_SECRET && process.env.AUTH_SECRET !== "change-me",
    SITE_URL: !!process.env.SITE_URL,
  };
  try {
    await db.$queryRaw`SELECT 1`;
    const tables = await db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM information_schema.tables WHERE table_name = 'SiteSettings'`;
    const migrated = Number(tables[0]?.n ?? 0) > 0;
    return NextResponse.json({ ok: migrated, migrated, env }, { status: migrated ? 200 : 503 });
  } catch (e) {
    const err = e as { name?: string; code?: string };
    return NextResponse.json({ ok: false, env, error: { name: err.name, code: err.code } }, { status: 503 });
  }
}
