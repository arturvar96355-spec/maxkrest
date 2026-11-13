import type { Metadata } from "next";
import { LeadWizard } from "@/components/LeadWizard";
import { PageHero } from "@/components/PageHero";
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
    <>
      <PageHero id="form" kind="complex" compact title={sp.callback ? "Заказать звонок" : "Оставить заявку"} lead="Это займёт 1–3 минуты. Стоимость обсуждаем после уточнения деталей." />
      <div className="container-x py-10">
      <LeadWizard initialService={initial} callback={!!sp.callback} contactMethods={contactMethods} />
      </div>
    </>
  );
}
