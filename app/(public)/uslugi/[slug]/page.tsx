import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getService, getServices } from "@/lib/content";
import { getSettings, siteUrl } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { ServiceIcon } from "@/components/ServiceIcon";
import { TrackedLink } from "@/components/TrackedLink";
import { telHref } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return { title: s.metaTitle || s.title, description: s.metaDesc || s.short, alternates: { canonical: `/uslugi/${s.slug}` } };
}

export default async function ServicePage({ params }: P) {
  const { slug } = await params;
  const [s, all, settings] = await Promise.all([getService(slug), getServices(), getSettings()]);
  if (!s) notFound();
  const others = all.filter((x) => x.slug !== s.slug).slice(0, 4);
  const ld = { "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.short, areaServed: settings.region, provider: { "@type": "LocalBusiness", name: settings.companyName }, url: `${siteUrl()}/uslugi/${s.slug}` };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero
        id={`svc-${s.slug}`}
        kind={s.formKey}
        image={s.image}
        icon={<ServiceIcon name={s.formKey} className="h-7 w-7" />}
        eyebrow={<nav aria-label="Хлебные крошки"><Link href="/" className="hover:underline">Главная</Link> / <Link href="/uslugi" className="hover:underline">Услуги</Link></nav>}
        title={s.title}
        lead={s.short}
      >
        <Link href={`/zayavka?service=${s.formKey}`} className="btn btn-accent">Оставить заявку <span aria-hidden className="ml-2">→</span></Link>
      </PageHero>
      <div className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <article>
          <p className="max-w-3xl text-lg">{s.body}</p>
          <h2 className="mt-10 text-xl font-semibold text-navy">Что входит в работы</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {s.works.map((w) => (
              <li key={w} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-ice" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500">Стоимость определяется индивидуально после уточнения деталей по вашему объекту.</p>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-navy p-6 text-white">
            <p className="text-lg font-semibold">Нужна эта услуга?</p>
            <p className="mt-1 text-sm text-slate-200">Оставьте заявку — свяжемся, уточним детали и подготовим предложение.</p>
            <Link href={`/zayavka?service=${s.formKey}`} className="btn btn-light mt-4 w-full">Оставить заявку</Link>
            <TrackedLink goal="phone_click" href={telHref(settings.phone)} className="mt-3 block text-center font-semibold">{settings.phone}</TrackedLink>
          </div>
          {others.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-slate-500">Другие услуги</p>
              <ul className="space-y-1">
                {others.map((o) => (
                  <li key={o.slug}><Link href={`/uslugi/${o.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-ice-50"><span className="text-ice"><ServiceIcon name={o.formKey} className="h-5 w-5" /></span>{o.title}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
    </>
  );
}
