import type { Metadata } from "next";
import { LeadWizard } from "@/components/LeadWizard";
import { FIELDS, type FormKey } from "@/lib/serviceFields";

export const metadata: Metadata = { title: "Оставить заявку", description: "Оставьте заявку на уборку снега — мы свяжемся и уточним детали.", alternates: { canonical: "/zayavka" } };

export default async function Page({ searchParams }: { searchParams: Promise<{ service?: string; callback?: string }> }) {
  const sp = await searchParams;
  const initial = sp.service && sp.service in FIELDS ? (sp.service as FormKey) : undefined;
  return (
    <div className="container-x py-10">
      <h1 className="mb-2 text-center text-3xl font-bold text-navy">{sp.callback ? "Заказать звонок" : "Оставить заявку"}</h1>
      <p className="mb-8 text-center text-slate-600">Это займёт 1–3 минуты. Стоимость обсуждаем после уточнения деталей.</p>
      <LeadWizard initialService={initial} callback={!!sp.callback} />
    </div>
  );
}
