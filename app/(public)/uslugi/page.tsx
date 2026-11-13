import Link from "next/link";
import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
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
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Link key={s.id} href={`/uslugi/${s.slug}`} className="rounded-xl border border-slate-200 p-6 transition hover:-translate-y-0.5 hover:border-ice hover:shadow-md">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-ice-50 text-navy"><ServiceIcon name={s.formKey} /></span>
            <h2 className="text-lg font-semibold text-navy">{s.title}</h2>
            <p className="mt-2 text-slate-600">{s.short}</p>
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}
