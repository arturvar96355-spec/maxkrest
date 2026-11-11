import Link from "next/link";
import type { Metadata } from "next";
import { getSettings, siteUrl } from "@/lib/site";
import { getServices, getHomeBlocks } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { TrackedLink } from "@/components/TrackedLink";
import { CallbackForm } from "@/components/CallbackForm";
import { ServiceIcon } from "@/components/ServiceIcon";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Timeline } from "@/components/Timeline";
import { Parallax } from "@/components/Parallax";
import { telHref } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: `${s.heroTitle} | ${s.companyName}` }, description: s.heroText, alternates: { canonical: "/" } };
}

const objectTypes = [
  ["private", "Частные дома и участки"],
  ["commercial", "Жилые комплексы"],
  ["commercial", "Бизнес-центры и офисы"],
  ["commercial", "Торговые объекты"],
  ["removal", "Склады и предприятия"],
  ["parking", "Парковки и проезды"],
] as const;

const snow = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 6.4 + 3) % 100}%`,
  size: 3 + (i % 4) * 1.5,
  dur: 9 + (i % 5) * 2.2,
  delay: -((i * 1.7) % 12),
  drift: (i % 2 ? 1 : -1) * (14 + (i % 3) * 10),
}));

function Section({ n, label, title, lead, children, id }: { n: string; label: string; title: string; lead?: string; children: React.ReactNode; id?: string }) {
  return (
    <Reveal stagger>
      <div data-reveal id={id} className="scroll-mt-24">
        <p className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[.14em] text-ice">
          <span className="tabular-nums">{n}</span><span aria-hidden className="h-px w-10 bg-ice/60" />{label}
        </p>
        <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-navy sm:text-4xl">{title}</h2>
        {lead && <p className="mt-3 max-w-2xl text-lg text-slate-600">{lead}</p>}
      </div>
      {children}
    </Reveal>
  );
}

function Marquee() {
  const row = objectTypes.map(([icon, label]) => (
    <span key={label} className="flex items-center gap-3 whitespace-nowrap text-sm font-medium uppercase tracking-wider text-slate-600">
      <span className="text-ice"><ServiceIcon name={icon} className="h-5 w-5" /></span>{label}
      <span aria-hidden className="ml-7 text-ice/50">✦</span>
    </span>
  ));
  return (
    <div className="marquee border-y border-slate-200 bg-white py-5" aria-label="С какими объектами мы работаем">
      <div className="marquee-track">{row}</div>
      <div className="marquee-track" aria-hidden>{row}</div>
    </div>
  );
}

export default async function Home() {
  const [s, services, { advantages, steps, photos, reviews }] = await Promise.all([getSettings(), getServices(), getHomeBlocks()]);
  const ld = { "@context": "https://schema.org", "@type": "LocalBusiness", name: s.companyName, telephone: s.phone, areaServed: s.region, url: siteUrl() };
  const words = s.heroTitle.split(/\s+/);
  const bento = services.length === 7;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ===== Первый экран ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy to-navy-700 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-ice/20 blur-3xl" />
        <Parallax className="pointer-events-none absolute -right-24 top-4 h-[30rem] w-[30rem] text-white/[.06]" y={160} rotate={40}>
          <svg viewBox="0 0 100 100" className="floaty h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <path d="M50 5v90M10 27.5l80 45M10 72.5l80-45M50 5l-8 8m8-8 8 8M50 95l-8-8m8 8 8-8M11 28l11-1m-11 1 4 10M89 72l-11 1m11-1-4-10M11 72l4-10m-4 10 11 1M89 28l-4 10m4-10-11-1" />
            <circle cx="50" cy="50" r="12" />
          </svg>
        </Parallax>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {snow.map((f, i) => (
            <span key={i} className="snow" style={{ left: f.left, width: f.size, height: f.size, ["--dur" as string]: `${f.dur}s`, ["--delay" as string]: `${f.delay}s`, ["--drift" as string]: `${f.drift}px` }} />
          ))}
        </div>

        <div className="container-x relative grid gap-12 pb-28 pt-14 md:pt-20 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pb-36">
          <div>
            <p className="fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm" style={{ ["--d" as string]: "0s" }}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ice" />{s.region}
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {words.map((w, i) => (
                <span key={i}>
                  <span className="hero-word"><span style={{ ["--d" as string]: `${0.12 + i * 0.08}s` }}>{w}</span></span>{" "}
                </span>
              ))}
            </h1>
            <p className="fade-up mt-6 max-w-xl text-lg text-slate-200" style={{ ["--d" as string]: "0.6s" }}>{s.heroText}</p>
            <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "0.75s" }}>
              <Link href="/zayavka" className="btn btn-light">Оставить заявку</Link>
              <a href="#callback" className="btn border-2 border-white/80 text-white hover:bg-white/10 lg:hidden">Заказать звонок</a>
            </div>
            <ul className="fade-up mt-8 grid max-w-xl gap-x-6 gap-y-2 text-sm text-slate-200 sm:grid-cols-2" style={{ ["--d" as string]: "0.9s" }}>
              {["Частные клиенты и организации", "Вручную и техникой", "Условия — после уточнения деталей", "Заявка с фото за 1–3 минуты"].map((t) => (
                <li key={t} className="flex items-center gap-2"><span aria-hidden className="text-ice">✓</span>{t}</li>
              ))}
            </ul>
            <div className="fade-up mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ ["--d" as string]: "1s" }}>
              <TrackedLink goal="phone_click" href={telHref(s.phone)} className="text-xl font-semibold">{s.phone}</TrackedLink>
              {s.telegramUrl && <TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener" className="underline">Telegram</TrackedLink>}
              {s.whatsappUrl && <TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener" className="underline">WhatsApp</TrackedLink>}
            </div>
          </div>
          <div id="callback" className="fade-up scroll-mt-24" style={{ ["--d" as string]: "0.5s" }}><CallbackForm dark /></div>
        </div>

        {/* «сугроб» на стыке с белым блоком */}
        <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] h-14 w-full text-white sm:h-20">
          <path fill="currentColor" d="M0 90V52c120 26 230 30 360 10 150-24 260-48 430-30 150 16 240 44 380 38 110-5 190-26 270-44v64Z" />
        </svg>
      </section>

      <Marquee />

      {/* ===== Услуги (bento) ===== */}
      <section className="container-x mt-20">
        <Section n="01" label="Что мы делаем" title="Услуги" lead="Выберите направление: на странице услуги — перечень работ и кнопка заявки.">
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-4">
            {services.map((sv, i) => {
              const big = bento && i === 0;
              const wide = bento && i >= 5;
              return (
                <SpotlightCard key={sv.id} href={`/uslugi/${sv.slug}`} className={`group flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:border-ice hover:shadow-xl ${big ? "border-navy bg-navy text-white lg:col-span-2 lg:row-span-2 lg:p-8" : "border-slate-200 bg-white"} ${wide ? "lg:col-span-2" : ""}`}>
                  <span className={`grid place-items-center rounded-xl transition-colors ${big ? "h-14 w-14 bg-white/10 text-white" : "h-11 w-11 bg-ice-50 text-navy group-hover:bg-navy group-hover:text-white"}`}>
                    <ServiceIcon name={sv.formKey} className={big ? "h-7 w-7" : "h-6 w-6"} />
                  </span>
                  <h3 className={`mt-4 font-semibold ${big ? "text-2xl lg:text-3xl" : "text-navy"}`}>{sv.title}</h3>
                  <p className={`mt-2 flex-1 ${big ? "max-w-md text-slate-200" : "text-sm text-slate-600"}`}>{sv.short}</p>
                  <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-1 ${big ? "text-white" : "text-ice"}`}>Подробнее <span aria-hidden>→</span></span>
                </SpotlightCard>
              );
            })}
          </div>
        </Section>
      </section>

      {/* ===== Преимущества (тёмная секция) ===== */}
      <section className="mt-24 bg-navy-900 py-20 text-white">
        <div className="container-x">
          <Reveal stagger>
            <div data-reveal>
              <p className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[.14em] text-ice"><span>02</span><span aria-hidden className="h-px w-10 bg-ice/60" />Почему мы</p>
              <h2 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Преимущества</h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((a, i) => (
                <div data-reveal key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                  <span className="text-4xl font-bold text-ice/80 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{a.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Как мы работаем ===== */}
      <section id="how" className="container-x mt-24 scroll-mt-20">
        <Section n="03" label="От заявки до работ" title="Как мы работаем">
          <Timeline className="relative mt-10">
            <div aria-hidden className="absolute left-[1.05rem] top-4 hidden h-[calc(100%-2rem)] w-px bg-slate-200 max-md:block" />
            <div aria-hidden data-line-v style={{ transform: "scaleY(0)" }} className="absolute left-[1.05rem] top-4 h-[calc(100%-2rem)] w-px origin-top bg-ice md:hidden" />
            <div aria-hidden className="absolute left-[10%] right-[10%] top-[1.05rem] hidden h-px bg-slate-200 md:block" />
            <div aria-hidden data-line-h style={{ transform: "scaleX(0)" }} className="absolute left-[10%] right-[10%] top-[1.05rem] hidden h-px origin-left bg-ice md:block" />
            <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
              {steps.map((st, i) => (
                <li data-step key={st.id} className="flex gap-4 md:flex-col md:items-center md:text-center">
                  <span className="step-dot relative z-10 grid h-[2.1rem] w-[2.1rem] shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                  <div className="step-card flex-1 rounded-xl border border-slate-200 bg-white p-4 md:w-full">
                    <h3 className="font-semibold text-navy">{st.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Timeline>
        </Section>
      </section>

      {photos.length > 0 && (
        <section className="container-x mt-24">
          <Section n="04" label="Результат" title="Выполненные работы">
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} data-reveal src={`/api/files/${p.storedAs}`} alt={p.caption ?? "Выполненные работы"} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              ))}
            </div>
          </Section>
        </section>
      )}

      {/* ===== Объекты ===== */}
      <section className="container-x mt-24">
        <Section n={photos.length > 0 ? "05" : "04"} label="Для кого" title="С какими объектами работаем">
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {objectTypes.map(([icon, label]) => (
              <li data-reveal key={label} className="spot flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-ice">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-ice-50 text-navy"><ServiceIcon name={icon} className="h-5 w-5" /></span>
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </Section>
      </section>

      {reviews.length > 0 && (
        <section className="container-x mt-24">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">Отзывы</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <blockquote key={r.id} className="rounded-2xl border border-slate-200 p-6">
                <p>{r.text}</p>
                <footer className="mt-3 text-sm font-semibold text-navy">{r.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* ===== Призыв ===== */}
      <section className="container-x mt-24">
        <Reveal>
          <div className="cta-band relative overflow-hidden rounded-3xl p-8 text-white sm:p-14">
            <svg aria-hidden viewBox="0 0 100 100" className="floaty absolute -right-10 -top-10 h-64 w-64 text-white/[.07]" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M50 5v90M10 27.5l80 45M10 72.5l80-45" /><circle cx="50" cy="50" r="12" /></svg>
            <h2 className="relative max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Оставьте заявку — свяжемся и уточним детали</h2>
            <p className="relative mt-3 max-w-xl text-slate-200">Заполнение занимает 1–3 минуты. Стоимость обсуждаем после уточнения деталей и готовим индивидуальное предложение.</p>
            <Link href="/zayavka" className="btn btn-light relative mt-7">Оставить заявку</Link>
          </div>
        </Reveal>
      </section>

      {/* ===== Контакты ===== */}
      <section className="container-x mt-24">
        <Section n={reviews.length > 0 ? "06" : photos.length > 0 ? "06" : "05"} label="Как связаться" title="Контакты и география работы">
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div data-reveal className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Телефон</p>
              <TrackedLink goal="phone_click" href={telHref(s.phone)} className="mt-1 block text-2xl font-semibold text-navy">{s.phone}</TrackedLink>
              {s.email && <a href={`mailto:${s.email}`} className="mt-2 block text-sm underline">{s.email}</a>}
            </div>
            <div data-reveal className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Мессенджеры</p>
              <div className="mt-1 flex flex-col gap-1">
                {s.telegramUrl ? <TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener" className="font-semibold text-navy">Написать в Telegram</TrackedLink> : null}
                {s.whatsappUrl ? <TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener" className="font-semibold text-navy">Написать в WhatsApp</TrackedLink> : null}
                {!s.telegramUrl && !s.whatsappUrl && <span className="text-slate-500">Будут указаны после настройки</span>}
              </div>
            </div>
            <div data-reveal className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">География работы</p>
              <p className="mt-1 text-xl font-semibold text-navy">{s.region}</p>
              {s.address && <p className="mt-2 text-sm">{s.address}</p>}
            </div>
          </div>
        </Section>
      </section>
    </>
  );
}
