import Link from "next/link";
import type { LeadStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { STATUS_LABEL, STATUSES, paramsSummary } from "@/lib/leadView";
import { serviceLabel } from "@/lib/serviceFields";
import { formatPhone } from "@/lib/phone";

const PAGE = 25;

export default async function Leads({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.LeadWhereInput = {};
  if (sp.status && sp.status in STATUS_LABEL) where.status = sp.status as LeadStatus;
  if (sp.q) {
    const n = Number(sp.q.replace(/\D/g, ""));
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { phone: { contains: sp.q.replace(/\D/g, "").slice(-10) || "__", } },
      { street: { contains: sp.q, mode: "insensitive" } },
      ...(n ? [{ number: n }] : []),
    ];
  }
  const [rows, total, unsent] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    db.lead.count({ where }),
    db.lead.count({ where: { notifyState: { not: "SENT" } } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const qs = (p: number) => new URLSearchParams({ ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { q: sp.q } : {}), page: String(p) }).toString();
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Заявки <span className="text-base font-normal text-slate-500">({total})</span></h1>
      {unsent > 0 && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Уведомление в Telegram не доставлено по {unsent} заявкам — они сохранены, отправка повторяется автоматически. Откройте карточку, чтобы отправить вручную.</p>}
      <form className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Имя, телефон, адрес, №" className="field !w-64" />
        <select name="status" defaultValue={sp.status ?? ""} className="field !w-64">
          <option value="">Все статусы</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn btn-primary !min-h-12">Найти</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>{["№", "Поступила", "Клиент", "Услуга", "Адрес", "Параметры", "Желаемая дата", "Статус"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-slate-100 align-top hover:bg-ice-50">
                <td className="px-3 py-2"><Link className="font-semibold text-navy underline" href={`/admin/zayavki/${l.id}`}>{l.number}</Link></td>
                <td className="px-3 py-2 whitespace-nowrap">{l.createdAt.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</td>
                <td className="px-3 py-2">{l.name}<br /><a href={`tel:${l.phone}`} className="text-ice">{formatPhone(l.phone)}</a></td>
                <td className="px-3 py-2">{l.services.map(serviceLabel).join(", ")}</td>
                <td className="px-3 py-2">{[l.city, l.street].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-3 py-2">{paramsSummary(l.params) || "—"}</td>
                <td className="px-3 py-2">{l.desiredAt || "—"}</td>
                <td className="px-3 py-2">{STATUS_LABEL[l.status]}{l.notifyState !== "SENT" && <span title="Telegram не доставлен" className="ml-1">⚠️</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500">Заявок нет</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm">
        {page > 1 && <Link href={`?${qs(page - 1)}`} className="underline">← Назад</Link>}
        <span>Стр. {page} из {pages}</span>
        {page < pages && <Link href={`?${qs(page + 1)}`} className="underline">Далее →</Link>}
      </div>
    </>
  );
}
