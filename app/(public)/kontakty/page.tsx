import type { Metadata } from "next";
import { getSettings } from "@/lib/site";
import { TrackedLink } from "@/components/TrackedLink";
import { telHref } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Контакты", alternates: { canonical: "/kontakty" } };

export default async function Contacts() {
  const s = await getSettings();
  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-bold text-navy">Контакты</h1>
      <dl className="mt-6 space-y-3 text-lg">
        <div><dt className="text-sm text-slate-500">Телефон</dt><dd><TrackedLink goal="phone_click" href={telHref(s.phone)} className="font-semibold text-navy">{s.phone}</TrackedLink></dd></div>
        {s.email && <div><dt className="text-sm text-slate-500">E-mail</dt><dd><a href={`mailto:${s.email}`}>{s.email}</a></dd></div>}
        {s.address && <div><dt className="text-sm text-slate-500">Адрес</dt><dd>{s.address}</dd></div>}
        <div><dt className="text-sm text-slate-500">География работы</dt><dd>{s.region}</dd></div>
        {s.telegramUrl && <div><dt className="text-sm text-slate-500">Telegram</dt><dd><TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener">Написать в Telegram</TrackedLink></dd></div>}
        {s.whatsappUrl && <div><dt className="text-sm text-slate-500">WhatsApp</dt><dd><TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener">Написать в WhatsApp</TrackedLink></dd></div>}
      </dl>
    </div>
  );
}
