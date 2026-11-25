import { NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validation/review";
import { hit, clientIp } from "@/lib/rateLimit";
import { sendTelegram } from "@/lib/telegram";
import { siteUrl } from "@/lib/site";

export const runtime = "nodejs";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/** Приём отзыва посетителя. Отзыв попадает на модерацию и на сайте не виден, пока менеджер его не опубликует. */
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Демо-режим: база данных не подключена, отзывы не принимаются." }, { status: 503 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 }); }
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
    return NextResponse.json({ error: "Проверьте поля формы", fields }, { status: 422 });
  }
  const d = parsed.data;
  // Антиспам: заполненная «ловушка» или слишком быстрая отправка — тихо «успех» без сохранения
  if (d.website || Date.now() - d.startedAt < 4000) return NextResponse.json({ ok: true });
  if (!(await hit(`review:${clientIp(req.headers)}`, 3, 3600))) return NextResponse.json({ error: "Слишком много отзывов с вашего адреса. Попробуйте позже." }, { status: 429 });

  const review = await db.review.create({
    data: { author: d.author, rating: d.rating, text: d.text, serviceKey: d.serviceKey || null, contact: d.contact || null, consentAt: new Date(), status: "PENDING", source: "site" },
  });
  after(async () => {
    try {
      await sendTelegram(`<b>Новый отзыв на модерации</b>\n${"★".repeat(review.rating ?? 0)}${"☆".repeat(5 - (review.rating ?? 0))} ${esc(review.author)}\n${esc(review.text.slice(0, 300))}\n${siteUrl()}/admin/otzyvy`);
    } catch (e) {
      console.error("[review] уведомление не отправлено", String(e)); // отзыв сохранён, уведомление необязательно
    }
  });
  return NextResponse.json({ ok: true });
}
