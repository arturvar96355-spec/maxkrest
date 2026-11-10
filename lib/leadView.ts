import type { LeadStatus } from "@prisma/client";
import { FIELDS, type FormKey } from "@/lib/serviceFields";

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В обработке",
  CONTACTED: "С клиентом связались",
  AWAITING_INSPECTION: "Ожидает уточнения/осмотра",
  PREPARING_OFFER: "Готовится коммерческое предложение",
  OFFER_SENT: "Коммерческое предложение отправлено",
  CONFIRMED: "Заказ подтверждён",
  IN_WORK: "Выполняется",
  DONE: "Выполнена",
  CANCELLED: "Отменена",
};
export const STATUSES = Object.keys(STATUS_LABEL) as LeadStatus[];

type P = Record<string, Record<string, string>>;

export function paramRows(params: unknown): { service: string; label: string; value: string }[] {
  const p = (params ?? {}) as P;
  const out: { service: string; label: string; value: string }[] = [];
  for (const [svc, row] of Object.entries(p)) {
    for (const [k, v] of Object.entries(row)) {
      const def = FIELDS[svc as FormKey]?.find((f) => f.name === k);
      out.push({ service: svc, label: def?.label ?? k, value: v === "unknown" ? "не знаю" : v + (def?.unit ? ` ${def.unit}` : "") });
    }
  }
  return out;
}

/** Краткая сводка для таблицы: площадь и основные параметры. */
export function paramsSummary(params: unknown): string {
  const rows = paramRows(params);
  const pick = rows.filter((r) => /площад|объ[её]м|парковоч|Тип крыши|Способ/i.test(r.label));
  return (pick.length ? pick : rows).slice(0, 3).map((r) => `${r.label}: ${r.value}`).join("; ");
}
