import { db } from "@/lib/db";
import { serviceLabel } from "@/lib/serviceFields";
import { formatReviewDate } from "@/lib/reviews";
import { Stars } from "@/components/Stars";
import { saveReview, createReview, deleteReview } from "../../actions";
import type { ReviewStatus } from "@prisma/client";

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "PENDING", label: "На проверке" },
  { key: "APPROVED", label: "Опубликованные" },
  { key: "REJECTED", label: "Отклонённые" },
];

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const tab = (TABS.find((t) => t.key === sp.status)?.key ?? "PENDING") as ReviewStatus;
  const [items, counts] = await Promise.all([
    db.review.findMany({ where: { status: tab }, orderBy: { createdAt: "desc" } }),
    db.review.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (k: string) => counts.find((c) => c.status === k)?._count ?? 0;
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Отзывы</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">Отзывы посетителей сначала попадают сюда. На сайте виден только тот отзыв, который вы опубликовали. Можно поправить опечатки и добавить ответ компании.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t.key} href={`?status=${t.key}`} className={`rounded-full px-4 py-2 text-sm font-medium ${t.key === tab ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {t.label} <span className="opacity-70">({count(t.key)})</span>
          </a>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {items.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Здесь пока ничего нет</p>}
        {items.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {r.rating ? <Stars value={r.rating} /> : <span>без оценки</span>}
              <span>{formatReviewDate(r.publishedAt ?? r.createdAt)}</span>
              <span>{r.source === "admin" ? "добавлен администратором" : "оставлен на сайте"}</span>
              {r.serviceKey && <span>услуга: {serviceLabel(r.serviceKey)}</span>}
              {r.contact && <span>контакт для проверки: <b className="text-slate-700">{r.contact}</b></span>}
            </div>
            <form action={saveReview} className="mt-3 grid gap-3">
              <input type="hidden" name="id" value={r.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                <div><label className="label">Имя (как показывается на сайте)</label><input name="author" defaultValue={r.author} className="field" /></div>
                <div><label className="label">Оценка</label><select name="rating" defaultValue={r.rating ?? ""} className="field"><option value="">нет</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
              </div>
              <div><label className="label">Текст отзыва</label><textarea name="text" rows={4} defaultValue={r.text} className="field" /></div>
              <div><label className="label">Ответ компании (показывается под отзывом, необязательно)</label><textarea name="reply" rows={2} defaultValue={r.reply ?? ""} className="field" /></div>
              <div className="flex flex-wrap gap-2">
                {r.status !== "APPROVED" && <button name="status" value="APPROVED" className="btn btn-primary !min-h-10 !py-2">Опубликовать</button>}
                {r.status === "APPROVED" && <button name="status" value="APPROVED" className="btn btn-secondary !min-h-10 !py-2">Сохранить изменения</button>}
                {r.status !== "REJECTED" && <button name="status" value="REJECTED" className="btn btn-secondary !min-h-10 !py-2">Отклонить</button>}
                {r.status !== "PENDING" && <button name="status" value="PENDING" className="btn btn-secondary !min-h-10 !py-2">Вернуть на проверку</button>}
              </div>
            </form>
            <form action={deleteReview} className="mt-3 flex items-center gap-3 text-sm">
              <input type="hidden" name="id" value={r.id} />
              <label className="flex items-center gap-2"><input type="checkbox" name="confirm" value="yes" required className="h-5 w-5" /> Подтверждаю удаление</label>
              <button className="text-red-700 underline">Удалить</button>
            </form>
          </div>
        ))}
      </div>

      <details className="mt-10 rounded-xl border border-dashed border-slate-300 p-5">
        <summary className="cursor-pointer font-semibold">+ Добавить отзыв вручную</summary>
        <p className="mt-2 text-sm text-slate-600">Только подтверждённые отзывы реальных клиентов. Сразу публикуется на сайте.</p>
        <form action={createReview} className="mt-4 grid max-w-2xl gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <div><label className="label">Имя</label><input name="author" required className="field" /></div>
            <div><label className="label">Оценка</label><select name="rating" defaultValue="5" className="field"><option value="">нет</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <div><label className="label">Текст отзыва</label><textarea name="text" required rows={4} className="field" /></div>
          <div><label className="label">Ответ компании (необязательно)</label><textarea name="reply" rows={2} className="field" /></div>
          <button className="btn btn-primary w-fit">Добавить и опубликовать</button>
        </form>
      </details>
    </>
  );
}
