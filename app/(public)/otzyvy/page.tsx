import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { Stars } from "@/components/Stars";
import { getPublishedReviews, statsOf } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Отзывы клиентов", description: "Отзывы клиентов об уборке снега, очистке крыш и вывозе снега. Можно оставить свой отзыв.", alternates: { canonical: "/otzyvy" } };

export default async function ReviewsPage() {
  const { reviews, demo } = await getPublishedReviews();
  const st = statsOf(reviews);
  return (
    <>
      <PageHero id="reviews" kind="complex" compact title="Отзывы клиентов" lead="Отзывы появляются на сайте после проверки менеджером." />
      <div className="container-x py-10">
        {demo && <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Макет оформления: ниже примерные тексты, не реальные отзывы. В рабочем режиме показываются только отзывы, прошедшие проверку.</p>}
        <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
          <div>
            {st.count > 0 ? (
              <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-ice-50 p-6">
                <div>
                  <p className="text-5xl font-bold tabular-nums text-navy">{st.average.toFixed(1)}</p>
                  <Stars value={st.average} className="h-5 w-5" />
                </div>
                <p className="text-slate-600">Средняя оценка по {st.count} {st.count % 10 === 1 && st.count % 100 !== 11 ? "отзыву" : "отзывам"}{demo ? " (макет)" : ""}</p>
              </div>
            ) : (
              <div className="mb-8 rounded-2xl bg-ice-50 p-6 text-slate-700">
                <p className="text-lg font-semibold text-navy">Отзывов пока нет</p>
                <p className="mt-1">Будем рады вашему отзыву — форма рядом.</p>
              </div>
            )}
            {reviews.length > 0 && (
              <Reveal stagger>
                <div className="grid gap-4 md:grid-cols-2">{reviews.map((r) => <ReviewCard key={r.id} r={r} />)}</div>
              </Reveal>
            )}
          </div>
          <aside id="form" className="scroll-mt-24 lg:sticky lg:top-24"><ReviewForm /></aside>
        </div>
      </div>
    </>
  );
}
