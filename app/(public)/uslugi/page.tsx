import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ServiceIcon } from "@/components/ServiceIcon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Услуги по уборке снега",
  description: "Уборка территорий, очистка крыш, парковок, механизированная уборка и вывоз снега в Москве и Московской области.",
  alternates: { canonical: "/uslugi" },
};

export default async function Services() {
  const services = await getServices();
  return (
    <>
      <PageHero id="svc-index" kind="mechanized" title="Услуги" lead="Уборка снега, очистка крыш, парковок и проездов, механизированная уборка и вывоз снега в Москве и Московской области." />
      <div className="container-x py-10">
        <Reveal stagger>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <SpotlightCard key={s.id} href={`/uslugi/${s.slug}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-ice hover:shadow-xl">
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-ice-50 text-navy transition-colors group-hover:bg-navy group-hover:text-white"><ServiceIcon name={s.formKey} /></span>
                <h2 className="text-lg font-semibold text-navy">{s.title}</h2>
                <p className="mt-2 flex-1 text-slate-600">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ice transition-transform group-hover:translate-x-1">Подробнее <span aria-hidden>→</span></span>
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </div>
    </>
  );
}
