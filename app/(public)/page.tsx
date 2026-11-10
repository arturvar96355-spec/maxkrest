import Link from "next/link";
import type { Metadata } from "next";
import { getServices, getHomeBlocks } from "@/lib/content";
import { getSettings, siteUrl } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { TrackedLink } from "@/components/TrackedLink";
import { telHref } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: `${s.heroTitle} | ${s.companyName}` }, description: s.heroText, alternates: { canonical: "/" } };
}

const objectTypes = ["Частные дома и участки", "Жилые комплексы", "Бизнес-центры и офисы", "Торговые объекты", "Склады и предприятия", "Парковки и проезды"];

export default async function Home() {
  const [s, services, { advantages, steps, photos, reviews }] = await Promise.all([getSettings(), getServices(), getHomeBlocks()]);
  const ld = { "@context": "https://schema.org", "@type": "LocalBusiness", name: s.companyName, telephone: s.phone, areaServed: s.region, url: siteUrl() };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-700 text-white">
        <svg aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-[28rem] w-[28rem] text-white/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M50 5v90M10 27.5l80 45M10 72.5l80-45M50 5l-8 8m8-8 8 8M50 95l-8-8m8 8 8-8" />
          <circle cx="50" cy="50" r="12" />
        </svg>
        <div className="container-x relative py-16 md:py-24">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-sm">{s.region}</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{s.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-200">{s.heroText}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/zayavka" className="btn btn-light">Оставить заявку</Link>
            <Link href="/zayavka?callback=1" className="btn border-2 border-white text-white hover:bg-white/10">Заказать звонок</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <TrackedLink goal="phone_click" href={telHref(s.phone)} className="text-lg font-semibold">{s.phone}</TrackedLink>
            {s.telegramUrl && <TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener" className="underline">Telegram</TrackedLink>}
            {s.whatsappUrl && <TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener" className="underline">WhatsApp</TrackedLink>}
          </div>
        </div>
      </section>

      <section className="container-x mt-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Услуги</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Выберите направление — на странице услуги описан перечень работ и можно сразу оставить заявку.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((sv, i) => (
              <Link key={sv.id} href={`/uslugi/${sv.slug}`} className="group flex flex-col rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-ice hover:shadow-md">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ice-50 text-sm font-bold text-navy">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-semibold text-navy">{sv.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{sv.short}</p>
                <span className="mt-4 text-sm font-semibold text-ice transition-transform group-hover:translate-x-1">Подробнее →</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-x mt-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Преимущества</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div key={a.id} className="rounded-xl bg-ice-50 p-5">
                <h3 className="font-semibold text-navy">{a.title}</h3>
                <p className="mt-2 text-sm">{a.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="how" className="container-x mt-16 scroll-mt-20">
        <Reveal>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Как мы работаем</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {steps.map((st, i) => (
              <li key={st.id} className="rounded-xl border border-slate-200 p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold">{st.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{st.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {photos.length > 0 && (
        <section className="container-x mt-16">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Выполненные работы</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={`/api/files/${p.storedAs}`} alt={p.caption ?? "Выполненные работы"} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="container-x mt-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">С какими объектами работаем</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {objectTypes.map((o) => <li key={o} className="rounded-lg border border-slate-200 px-4 py-3">{o}</li>)}
          </ul>
        </Reveal>
      </section>

      {reviews.length > 0 && (
        <section className="container-x mt-16">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Отзывы</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <blockquote key={r.id} className="rounded-xl border border-slate-200 p-5">
                <p>{r.text}</p>
                <footer className="mt-3 text-sm font-semibold text-navy">{r.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section className="container-x mt-16">
        <div className="rounded-2xl bg-navy p-8 text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Оставьте заявку — свяжемся и уточним детали</h2>
          <p className="mt-3 text-slate-200">Заполнение занимает 1–3 минуты. География работы: {s.region}.</p>
          <Link href="/zayavka" className="btn btn-light mt-6">Оставить заявку</Link>
        </div>
      </section>
    </>
  );
}
