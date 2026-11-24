import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/**
 * Подписанный параметр /start для бота: lead_<номер заявки>_<12 символов подписи>.
 * Подпись делается секретом LEAD_PULL_SECRET (только на сервере сайта), подделать ссылку на чужую заявку нельзя.
 */
const sig = (secret: string, leadId: number) => createHmac("sha256", secret).update(`lead:${leadId}`).digest("base64url").slice(0, 12);

export const makeStartParam = (secret: string, leadId: number) => `lead_${leadId}_${sig(secret, leadId)}`;

export function parseStartParam(secret: string, param: string): number | null {
  const m = /^lead_(\d{1,9})_([A-Za-z0-9_-]{12})$/.exec(param);
  if (!m) return null;
  const id = Number(m[1]);
  const a = Buffer.from(m[2]);
  const b = Buffer.from(sig(secret, id));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

/** Сравнение секретов за постоянное время (длины не важны: сравниваются хэши). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Ссылка на бота для заявки или null, если бот не настроен (BOT_USERNAME и LEAD_PULL_SECRET). */
export function botLinkFor(leadNumber: number): string | null {
  const bot = process.env.BOT_USERNAME?.replace(/^@/, "");
  const secret = process.env.LEAD_PULL_SECRET;
  if (!bot || !/^[A-Za-z0-9_]{5,32}$/.test(bot) || !secret || secret.length < 16 || leadNumber <= 0) return null;
  return `https://t.me/${bot}?start=${makeStartParam(secret, leadNumber)}`;
}
