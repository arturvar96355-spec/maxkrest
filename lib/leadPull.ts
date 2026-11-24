import type { Lead } from "@prisma/client";
import { formatPhone } from "@/lib/phone";
import { serviceLabel } from "@/lib/serviceFields";
import { paramRows } from "@/lib/leadView";

/**
 * Заявка в формате, который забирает бот (Worker): {name, contact, project, message, quiz}.
 * project — ключ первой услуги (бот знает названия), quiz — все остальные подробности одной строкой.
 */
export function leadToPull(l: Lead) {
  const contact = [formatPhone(l.phone), l.email, l.contactMethod && `удобно: ${l.contactMethod}`].filter(Boolean).join(", ");
  const details = [
    l.services.length > 1 && `Услуги: ${l.services.map(serviceLabel).join("; ")}`,
    l.organization && `Организация: ${l.organization}`,
    [l.city, l.street].filter(Boolean).length > 0 && `Адрес: ${[l.city, l.street].filter(Boolean).join(", ")}`,
    l.accessNotes && `Доступ: ${l.accessNotes}`,
    l.orderKind && `Характер заказа: ${l.orderKind}`,
    l.desiredAt && `Желаемое время: ${l.desiredAt}`,
    ...paramRows(l.params).map((r) => `${r.label}: ${r.value}`),
  ].filter(Boolean);
  return {
    name: l.name,
    contact,
    project: l.services[0] ?? "other",
    message: l.comment ?? "",
    quiz: details.join("; "),
  };
}
