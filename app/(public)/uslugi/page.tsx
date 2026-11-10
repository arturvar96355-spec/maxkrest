import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Услуги по уборке снега",
  description: "Уборка территорий, очистка крыш, парковок, механизированная уборка и вывоз снега в Москве и Московской области.",
  alternates: { canonical: "/uslugi" },
};

export default async function Services() {
  const services = await db.service.findMany({ where: { visible: true }, orderBy: { sort: "asc" } });
  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-bold text-navy">Услуги</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Link key={s.id} href={`/uslugi/${s.slug}`} className="rounded-xl border border-slate-200 p-6 hover:shadow-md">
            <h2 className="text-lg font-semibold text-navy">{s.title}</h2>
            <p className="mt-2 text-slate-600">{s.short}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
