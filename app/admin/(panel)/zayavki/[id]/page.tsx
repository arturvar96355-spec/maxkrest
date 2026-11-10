import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { STATUSES, STATUS_LABEL, paramRows } from "@/lib/leadView";
import { serviceLabel } from "@/lib/serviceFields";
import { formatPhone } from "@/lib/phone";
import { setStatus, addNote, saveInternal, resendNotify, deleteLead } from "../../../actions";

function D({ k, v }: { k: string; v?: string | null }) {
  return v ? <div><dt className="text-xs text-slate-500">{k}</dt><dd>{v}</dd></div> : null;
}

export default async function LeadCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await db.lead.findUnique({ where: { id }, include: { files: true, notes: { orderBy: { createdAt: "desc" } } } });
  if (!l) notFound();
  const rows = paramRows(l.params);
  return (
    <>
      <Link href="/admin/zayavki" className="text-sm underline">← К списку</Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Заявка №{l.number}</h1>
      <p className="text-sm text-slate-500">Поступила {l.createdAt.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <dl className="grid gap-4 rounded-xl border border-slate-200 p-5 sm:grid-cols-2">
            <D k="Имя" v={l.name} />
            <div><dt className="text-xs text-slate-500">Телефон</dt><dd><a href={`tel:${l.phone}`} className="font-semibold text-navy underline">{formatPhone(l.phone)}</a></dd></div>
            <D k="Организация" v={l.organization} />
            <D k="E-mail" v={l.email} />
            <D k="Способ связи" v={l.contactMethod} />
            <D k="Услуги" v={l.services.map(serviceLabel).join("; ")} />
            <D k="Город" v={l.city} />
            <D k="Адрес" v={l.street} />
            <D k="Доступ на объект" v={l.accessNotes} />
            <D k="Характер заказа" v={l.orderKind} />
            <D k="Желаемая дата" v={l.desiredAt} />
            <D k="Комментарий" v={l.comment} />
          </dl>
          {rows.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-5">
              <h2 className="mb-3 font-semibold">Параметры объекта</h2>
              <dl className="grid gap-3 sm:grid-cols-2">{rows.map((r, i) => <div key={i}><dt className="text-xs text-slate-500">{serviceLabel(r.service)} · {r.label}</dt><dd>{r.value}</dd></div>)}</dl>
            </div>
          )}
          {l.files.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-5">
              <h2 className="mb-3 font-semibold">Фотографии</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {l.files.map((f) => (
                  <figure key={f.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <a href={`/api/files/${f.storedAs}`} target="_blank"><img src={`/api/files/${f.storedAs}`} alt={f.origName} className="aspect-[4/3] w-full rounded-lg object-cover" /></a>
                    <figcaption className="mt-1 truncate text-xs"><a className="underline" href={`/api/files/${f.storedAs}?download=1`}>Скачать</a> · {f.origName}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <form action={setStatus} className="rounded-xl border border-slate-200 p-5">
            <input type="hidden" name="id" value={l.id} />
            <label className="label" htmlFor="status">Статус</label>
            <select id="status" name="status" defaultValue={l.status} className="field">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
            <button className="btn btn-primary mt-3 w-full">Сохранить статус</button>
          </form>

          <form action={saveInternal} className="space-y-3 rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold">Внутренние данные</h2>
            <input type="hidden" name="id" value={l.id} />
            <div><label className="label" htmlFor="price">Согласованная стоимость</label><input id="price" name="agreedPrice" defaultValue={l.agreedPrice ?? ""} className="field" /></div>
            <div><label className="label" htmlFor="outcome">Результат общения</label><textarea id="outcome" name="outcome" defaultValue={l.outcome ?? ""} rows={3} className="field" /></div>
            <button className="btn btn-secondary w-full">Сохранить</button>
          </form>

          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="mb-3 font-semibold">Заметки</h2>
            <form action={addNote} className="space-y-2">
              <input type="hidden" name="id" value={l.id} />
              <textarea name="text" required rows={3} className="field" placeholder="Внутренняя заметка (клиент не видит)" />
              <button className="btn btn-secondary w-full">Добавить</button>
            </form>
            <ul className="mt-4 space-y-3 text-sm">
              {l.notes.map((n) => <li key={n.id} className="rounded-lg bg-slate-50 p-3"><p className="whitespace-pre-wrap">{n.text}</p><p className="mt-1 text-xs text-slate-500">{n.createdAt.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</p></li>)}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-5 text-sm">
            <h2 className="mb-2 font-semibold">Telegram</h2>
            <p>{l.notifyState === "SENT" ? "Уведомление доставлено" : `Не доставлено (попыток: ${l.notifyAttempts})`}{l.notifyError && <><br /><span className="text-xs text-slate-500">{l.notifyError}</span></>}</p>
            {l.notifyState !== "SENT" && <form action={resendNotify} className="mt-2"><input type="hidden" name="id" value={l.id} /><button className="btn btn-secondary w-full">Отправить повторно</button></form>}
          </div>

          <form action={deleteLead} className="rounded-xl border border-red-200 p-5 text-sm">
            <input type="hidden" name="id" value={l.id} />
            <h2 className="mb-2 font-semibold text-red-800">Удалить заявку (спам)</h2>
            <label className="flex items-center gap-2"><input type="checkbox" name="confirm" value="yes" required className="h-5 w-5" /> Подтверждаю удаление</label>
            <button className="btn mt-3 w-full bg-red-700 text-white hover:bg-red-800">Удалить</button>
          </form>
        </aside>
      </div>
    </>
  );
}
