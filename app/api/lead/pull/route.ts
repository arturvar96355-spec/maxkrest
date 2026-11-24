import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseStartParam, safeEqual } from "@/lib/leadToken";
import { leadToPull } from "@/lib/leadPull";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Бот (Cloudflare Worker) забирает карточку заявки по подписанному токену из ссылки t.me/<бот>?start=lead_…
 * Нужны оба условия: заголовок x-pull-secret = LEAD_PULL_SECRET и корректная подпись токена.
 */
export async function GET(req: Request) {
  const secret = process.env.LEAD_PULL_SECRET;
  if (!secret || secret.length < 16 || !process.env.DATABASE_URL) return NextResponse.json({ ok: false }, { status: 503 });
  if (!safeEqual(req.headers.get("x-pull-secret") ?? "", secret)) return NextResponse.json({ ok: false }, { status: 403 });

  const number = parseStartParam(secret, new URL(req.url).searchParams.get("token") ?? "");
  if (number === null) return NextResponse.json({ ok: false }, { status: 404 });
  const lead = await db.lead.findUnique({ where: { number } });
  if (!lead) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, ...leadToPull(lead) }, { headers: { "cache-control": "no-store" } });
}
