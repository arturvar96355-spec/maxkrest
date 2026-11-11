import type { Metadata } from "next";
import { LeadWizard } from "@/components/LeadWizard";
import { FIELDS, CONTACT_METHODS, type FormKey } from "@/lib/serviceFields";
import { getSettings } from "@/lib/site";
import { isDemo } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Оставить заявку", description: "Оставьте заявку на уборку снега — мы свяжемся и уточним детали.", alternates: { canonical: "/zayavka" } };

export default async function Page({ searchParams }: { searchParams: Promise<{ service?: string; callback?: string }> }) {
  const sp = await searchParams;
  const [settings, demo] = await Promise.all([getSettings(), isDemo()]);
  // Мессенджеры предлагаем только те, что использует компания (в демо — все, для просмотра)
  const contactMethods = CONTACT_METHODS.filter((m) => demo || m === "Телефон" || (m === "Telegram" && settings.telegramUrl) || (m === "WhatsApp" && settings.whatsappUrl));
  const initial = sp.service && sp.service in FIELDS ? (sp.service as FormKey) : undefined;
  return (
    <div className="container-x py-10">
      <h1 className="mb-2 text-center text-3xl font-bold text-navy">{sp.callback ? "Заказать звонок" : "Оставить заявку"}</h1>
      <p className="mb-8 text-center text-slate-600">Это займёт 1–3 минуты. Стоимость обсуждаем после уточнения деталей.</p>
      <LeadWizard initialService={initial} callback={!!sp.callback} contactMethods={contactMethods} />
    </div>
  );
}
