import { Stars } from "./Stars";
import { serviceLabel } from "@/lib/serviceFields";
import { formatReviewDate, type PublicReview } from "@/lib/reviews";

export function ReviewCard({ r }: { r: PublicReview }) {
  return (
    <article data-reveal className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-ice/60 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-base font-bold text-white">{r.author.trim().charAt(0).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{r.author}</p>
          <p className="text-xs text-slate-500">{formatReviewDate(r.date)}</p>
        </div>
        {r.rating ? <span className="ml-auto"><Stars value={r.rating} /></span> : null}
      </div>
      {r.serviceKey && <p className="mt-4"><span className="inline-block rounded-full bg-ice-50 px-3 py-1 text-xs font-medium text-navy">{serviceLabel(r.serviceKey)}</span></p>}
      <p className="mt-4 flex-1 whitespace-pre-line text-[0.95rem] leading-relaxed text-slate-700">{r.text}</p>
      {r.reply && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice">Ответ компании</p>
          <p className="whitespace-pre-line text-slate-700">{r.reply}</p>
        </div>
      )}
    </article>
  );
}
