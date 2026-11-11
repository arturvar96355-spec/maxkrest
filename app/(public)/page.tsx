import Link from "next/link";
import type { Metadata } from "next";
import { getSettings, siteUrl } from "@/lib/site";
import { getServices, getHomeBlocks } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { TrackedLink } from "@/components/TrackedLink";
import { CallbackForm } from "@/components/CallbackForm";
import { ServiceIcon } from "@/components/ServiceIcon";
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

const snow = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 100}%`,
  size: 3 + (i % 4) * 1.5,
  dur: 9 + (i % 5) * 2.2,
  delay: -((i * 1.7) % 12),
  drift: (i % 2 ? 1 : -1) * (14 + (i % 3) * 10),
}));

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-ice">{children}</p>;
}

export default async function Home() {
  const [s, services, { advantages, steps, photos, reviews }] = await Promise.all([getSettings(), getServices(), getHomeBlocks()]);
  const ld = { "@context": "https://schema.org", "@type": "LocalBusiness", name: s.companyName, telephone: s.phone, areaServed: s.region, url: siteUrl() };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-700 text-white">
        <svg aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[32rem] w-[32rem] text-white/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M50 5v90M10 27.5l80 45M10 72.5l80-45M50 5l-8 8m8-8 8 8M50 95l-8-8m8 8 8-8" />
          <circle cx="50" cy="50" r="12" />
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {snow.map((f, i) => (
            <span key={i} className="snow" style={{ left: f.left, width: f.size, height: f.size, ["--dur" as string]: `${f.dur}s`, ["--delay" as string]: `${f.delay}s`, ["--drift" as string]: `${f.drift}px` }} />
          ))}
        </div>
        <div className="container-x relative grid gap-10 py-14 md:py-20 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-sm">{s.region}</p>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">{s.heroTitle}</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200">{s.heroText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/zayavka" className="btn btn-light">Оставить заявку</Link>
              <a href="#callback" className="btn border-2 border-white text-white hover:bg-white/10 lg:hidden">Заказать звонок</a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
              <li>✓ Частные клиенты и организации</li>
              <li>✓ Вручную и техникой</li>
              <li>✓ Условия — после уточнения деталей</li>
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <TrackedLink goal="phone_click" href={telHref(s.phone)} className="text-xl font-semibold">{s.phone}</TrackedLink>
              {s.telegramUrl && <TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener" className="underline">Telegram</TrackedLink>}
              {s.whatsappUrl && <TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener" className="underline">WhatsApp</TrackedLink>}
            </div>
          </div>
          <div id="callback" className="scroll-mt-24"><CallbackForm dark /></div>
        </div>
      </section>

      <section className="container-x mt-16">
        <Reveal stagger>
          <div data-reveal>
            <Eyebrow>Что мы делаем</Eyebrow>
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">Услуги</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Выберите направление: на странице услуги — перечень работ и кнопка заявки.</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((sv) => (
              <Link data-reveal key={sv.id} href={`/uslugi/${sv.slug}`} className="group flex flex-col rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-ice hover:shadow-md">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-ice-50 text-navy transition-colors group-hover:bg-navy group-hover:text-white"><ServiceIcon name={sv.formKey} /></span>
                <h3 className="mt-3 font-semibold text-navy">{sv.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{sv.short}</p>
                <span className="mt-4 text-sm font-semibold text-ice transition-transform group-hover:translate-x-1">Подробнее →</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-16 bg-ice-50 py-14">
        <div className="container-x">
          <Reveal stagger>
            <div data-reveal><Eyebrow>Почему мы</Eyebrow><h2 className="text-2xl font-bold text-navy sm:text-3xl">Преимущества</h2></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((a) => (
                <div data-reveal key={a.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <span aria-hidden className="mb-3 block h-1 w-10 rounded bg-ice" />
                  <h3 className="font-semibold text-navy">{a.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{a.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="how" className="container-x mt-16 scroll-mt-20">
        <Reveal stagger>
          <div data-reveal><Eyebrow>От заявки до работ</Eyebrow><h2 className="text-2xl font-bold text-navy sm:text-3xl">Как мы работаем</h2></div>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {steps.map((st, i) => (
              <li data-reveal key={st.id} className="relative rounded-xl border border-slate-200 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
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
        <Reveal stagger>
          <div data-reveal><Eyebrow>Для кого</Eyebrow><h2 className="text-2xl font-bold text-navy sm:text-3xl">С какими объектами работаем</h2></div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {objectTypes.map(([icon, label]) => (
              <li data-reveal key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <span className="text-ice"><ServiceIcon name={icon} className="h-5 w-5" /></span>{label}
              </li>
            ))}
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
          <p className="mt-3 text-slate-200">Заполнение занимает 1–3 минуты. Стоимость обсуждаем после уточнения деталей и подготовим индивидуальное предложение.</p>
          <Link href="/zayavka" className="btn btn-light mt-6">Оставить заявку</Link>
        </div>
      </section>

      <section className="container-x mt-16">
        <Eyebrow>Как связаться</Eyebrow>
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">Контакты и география работы</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Телефон</p>
            <TrackedLink goal="phone_click" href={telHref(s.phone)} className="mt-1 block text-xl font-semibold text-navy">{s.phone}</TrackedLink>
            {s.email && <a href={`mailto:${s.email}`} className="mt-2 block text-sm underline">{s.email}</a>}
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Мессенджеры</p>
            <div className="mt-1 flex flex-col gap-1">
              {s.telegramUrl ? <TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener" className="font-semibold text-navy">Написать в Telegram</TrackedLink> : null}
              {s.whatsappUrl ? <TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener" className="font-semibold text-navy">Написать в WhatsApp</TrackedLink> : null}
              {!s.telegramUrl && !s.whatsappUrl && <span className="text-slate-500">Будут указаны после настройки</span>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">География работы</p>
            <p className="mt-1 text-lg font-semibold text-navy">{s.region}</p>
            {s.address && <p className="mt-2 text-sm">{s.address}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
