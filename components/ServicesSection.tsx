import Link from "next/link";
import { Reveal } from "./Reveal";
import { ServiceIcon } from "./ServiceIcon";
import { SpotlightCard } from "./SpotlightCard";

export type ServiceVariant = "a" | "b" | "c" | "d";
export const parseServiceVariant = (v?: string): ServiceVariant => (v === "b" || v === "c" || v === "d" ? v : "a");

type Sv = { id: string; slug: string; title: string; short: string; formKey: string };

const Arrow = () => <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>;

/** Последняя плитка сетки: возможность оставить заявку, если подходящей услуги нет. Закрывает сетку 4×2. */
const CTA = { title: "Нужна другая задача?", text: "Опишите её в заявке: подскажем, как лучше сделать." };

/**
 * Блок «Услуги». Четыре варианта оформления (выбираются ?uslugi=a|b|c|d для сравнения; на сайте используется один):
 *  a — «шахматка»: плитки чередуются синий/белый, как в сетке;
 *  b — единый тёмный блок: все плитки одинаковые, без белых и без выделенной;
 *  c — светлые ровные плитки, заливка синим появляется только при наведении;
 *  d — спокойный список строками.
 */
export function ServicesSection({ services, variant }: { services: Sv[]; variant: ServiceVariant }) {
  const head = (dark: boolean, n: string) => (
    <div data-reveal>
      <p className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[.14em] text-ice"><span className="tabular-nums">{n}</span><span aria-hidden className="h-px w-10 bg-ice/60" />Что мы делаем</p>
      <h2 className={`max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-navy"}`}>Услуги</h2>
      <p className={`mt-3 max-w-2xl text-lg ${dark ? "text-slate-300" : "text-slate-600"}`}>Выберите направление: на странице услуги — перечень работ и кнопка заявки.</p>
    </div>
  );

  if (variant === "d")
    return (
      <section className="container-x mt-20">
        <Reveal stagger>
          {head(false, "01")}
          <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {services.map((sv, i) => (
              <li key={sv.id} data-reveal>
                <Link href={`/uslugi/${sv.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 px-2 py-5 transition-colors hover:bg-ice-50 sm:grid-cols-[3rem_3rem_1fr_auto] sm:gap-x-6">
                  <span className="text-sm font-semibold tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hidden h-11 w-11 place-items-center rounded-lg bg-ice-50 text-navy transition-colors group-hover:bg-navy group-hover:text-white sm:grid"><ServiceIcon name={sv.formKey} /></span>
                  <span>
                    <span className="block text-lg font-semibold text-navy">{sv.title}</span>
                    <span className="mt-0.5 block text-sm text-slate-600">{sv.short}</span>
                  </span>
                  <span className="text-xl text-ice transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    );

  if (variant === "b")
    return (
      <section className="mt-20 bg-navy-900 py-16 text-white">
        <div className="container-x">
          <Reveal stagger>
            {head(true, "01")}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((sv) => (
                <SpotlightCard key={sv.id} href={`/uslugi/${sv.slug}`} className="group flex flex-col rounded-2xl border border-white/10 bg-white/[.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/70 hover:bg-white/[.08]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-accent"><ServiceIcon name={sv.formKey} /></span>
                  <h3 className="mt-4 font-semibold">{sv.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-300">{sv.short}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#4d94ff]">Подробнее <Arrow /></span>
                </SpotlightCard>
              ))}
              <SpotlightCard href="/zayavka" className="group flex flex-col justify-between rounded-2xl border border-dashed border-white/25 p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/70">
                <div>
                  <h3 className="font-semibold">{CTA.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{CTA.text}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#4d94ff]">Оставить заявку <Arrow /></span>
              </SpotlightCard>
            </div>
          </Reveal>
        </div>
      </section>
    );

  if (variant === "c")
    return (
      <section className="container-x mt-20">
        <Reveal stagger>
          {head(false, "01")}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((sv) => (
              <Link key={sv.id} href={`/uslugi/${sv.slug}`} data-reveal className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl">
                <span aria-hidden className="absolute inset-x-0 bottom-0 top-0 translate-y-full bg-navy transition-transform duration-500 ease-out group-hover:translate-y-0" />
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-ice-50 text-navy transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white"><ServiceIcon name={sv.formKey} /></span>
                <h3 className="relative mt-4 font-semibold text-navy transition-colors duration-300 group-hover:text-white">{sv.title}</h3>
                <p className="relative mt-2 flex-1 text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-200">{sv.short}</p>
                <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ice transition-colors duration-300 group-hover:text-white">Подробнее <Arrow /></span>
              </Link>
            ))}
            <Link href="/zayavka" data-reveal className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-ice-50/60 p-6 transition-shadow duration-300 hover:shadow-xl">
              <span aria-hidden className="absolute inset-0 translate-y-full bg-navy transition-transform duration-500 ease-out group-hover:translate-y-0" />
              <div className="relative">
                <h3 className="font-semibold text-navy transition-colors duration-300 group-hover:text-white">{CTA.title}</h3>
                <p className="mt-2 text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-200">{CTA.text}</p>
              </div>
              <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ice transition-colors duration-300 group-hover:text-white">Оставить заявку <Arrow /></span>
            </Link>
          </div>
        </Reveal>
      </section>
    );

  // a — «шахматка»
  return (
    <section className="container-x mt-20">
      <Reveal stagger>
        {head(false, "01")}
        <div className="tiles mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((sv) => (
            <SpotlightCard key={sv.id} href={`/uslugi/${sv.slug}`} className="tile group flex flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span className="t-icon grid h-11 w-11 place-items-center rounded-xl transition-colors"><ServiceIcon name={sv.formKey} /></span>
              <h3 className="t-title mt-4 font-semibold">{sv.title}</h3>
              <p className="t-text mt-2 flex-1 text-sm">{sv.short}</p>
              <span className="t-link mt-5 inline-flex items-center gap-1 text-sm font-semibold">Подробнее <Arrow /></span>
            </SpotlightCard>
          ))}
          <SpotlightCard href="/zayavka" className="tile group flex flex-col justify-between rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div>
              <h3 className="t-title font-semibold">{CTA.title}</h3>
              <p className="t-text mt-2 text-sm">{CTA.text}</p>
            </div>
            <span className="t-link mt-5 inline-flex items-center gap-1 text-sm font-semibold">Оставить заявку <Arrow /></span>
          </SpotlightCard>
        </div>
      </Reveal>
    </section>
  );
}
