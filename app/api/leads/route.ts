import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadSchema, sanitizeParams } from "@/lib/validation/lead";
import { hit, clientIp } from "@/lib/rateLimit";
import { saveImage, MAX_FILES } from "@/lib/uploads";
import { notifyLead } from "@/lib/telegram";
import type { FormKey } from "@/lib/serviceFields";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!(await hit(`lead:${ip}`, 5, 600))) {
    return NextResponse.json({ error: "Слишком много заявок. Попробуйте позже." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? "{}"));
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
    return NextResponse.json({ error: "Проверьте поля формы", fields }, { status: 422 });
  }
  const d = parsed.data;

  // Антиспам: honeypot и слишком быстрая отправка (< 3 сек) — тихо «успех» без сохранения
  if (d.website || Date.now() - d.startedAt < 3000) {
    return NextResponse.json({ ok: true, number: 0 });
  }

  // Идемпотентность: повторная отправка того же ключа возвращает прежний номер
  const existing = await db.lead.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  if (existing) return NextResponse.json({ ok: true, number: existing.number });

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_FILES);
  const saved: { storedAs: string; mime: string; size: number; origName: string }[] = [];
  for (const f of files) {
    const s = await saveImage(Buffer.from(await f.arrayBuffer()), "leads");
    if (!s) return NextResponse.json({ error: `Файл «${f.name}» не подходит: допустимы JPG, PNG, WebP, HEIC до 8 МБ`, fields: { files: "Недопустимый файл" } }, { status: 422 });
    saved.push({ ...s, origName: f.name.slice(0, 120) });
  }

  const services = d.services as FormKey[];
  const params = sanitizeParams(services, d.params);
  const flat = Object.values(params).flatMap((r) => Object.entries(r));
  const objectType = flat.find(([k]) => k === "objectType")?.[1] ?? null;

  const lead = await db.lead.create({
    data: {
      services,
      params,
      objectType,
      city: d.city || null,
      street: d.street || null,
      accessNotes: d.accessNotes || null,
      orderKind: d.orderKind || null,
      desiredAt: d.desiredAt || null,
      name: d.name,
      phone: d.phone,
      organization: d.organization || null,
      email: d.email || null,
      contactMethod: d.contactMethod || null,
      comment: d.comment || null,
      consentAt: new Date(),
      idempotencyKey: d.idempotencyKey,
      files: { create: saved.map((s) => ({ storedAs: s.storedAs, origName: s.origName, mime: s.mime, size: s.size })) },
    },
  });

  // Заявка уже сохранена; ошибка Telegram её не отменяет (повтор через cron/админку).
  void notifyLead(lead.id).catch(() => {});

  return NextResponse.json({ ok: true, number: lead.number });
}
