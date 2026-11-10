import { db } from "@/lib/db";
import { serviceLabel } from "@/lib/serviceFields";
import { formatPhone } from "@/lib/phone";
import { siteUrl } from "@/lib/site";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

export function buildMessage(l: { number: number; name: string; phone: string; services: string[]; city: string | null; street: string | null; id: string }) {
  const addr = [l.city, l.street].filter(Boolean).join(", ") || "не указан";
  return [
    `<b>Новая заявка №${l.number}</b>`,
    `Имя: ${esc(l.name)}`,
    `Телефон: ${esc(formatPhone(l.phone))}`,
    `Услуга: ${esc(l.services.map(serviceLabel).join("; "))}`,
    `Адрес: ${esc(addr)}`,
    `${siteUrl()}/admin/zayavki/${l.id}`,
  ].join("\n");
}

export async function sendTelegram(text: string, chatIdOverride?: string | null): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = chatIdOverride || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram не настроен (TELEGRAM_BOT_TOKEN / chat id)");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Telegram HTTP ${res.status}`);
}

const BACKOFF_MIN = [1, 5, 15, 60, 180, 720];

/** Пытается отправить уведомление; при ошибке заявка остаётся в БД, повтор по расписанию. */
export async function notifyLead(leadId: string): Promise<boolean> {
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead || lead.notifyState === "SENT") return true;
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  try {
    await sendTelegram(buildMessage(lead), settings?.tgChatId);
    await db.lead.update({ where: { id: leadId }, data: { notifyState: "SENT", notifiedAt: new Date(), notifyError: null } });
    return true;
  } catch (e) {
    const attempts = lead.notifyAttempts + 1;
    const delay = BACKOFF_MIN[Math.min(attempts - 1, BACKOFF_MIN.length - 1)];
    console.error("[notify] failed", { leadId, attempts, error: String(e) });
    await db.lead.update({
      where: { id: leadId },
      data: {
        notifyState: attempts >= 20 ? "FAILED" : "PENDING",
        notifyAttempts: attempts,
        notifyNextAt: new Date(Date.now() + delay * 60_000),
        notifyError: String(e).slice(0, 300),
      },
    });
    return false;
  }
}

export async function retryPending(limit = 20): Promise<number> {
  const due = await db.lead.findMany({
    where: { notifyState: "PENDING", notifyNextAt: { lte: new Date() } },
    select: { id: true },
    take: limit,
    orderBy: { createdAt: "asc" },
  });
  let ok = 0;
  for (const l of due) if (await notifyLead(l.id)) ok++;
  return ok;
}
