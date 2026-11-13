import Link from "next/link";
import { TrackedLink } from "./TrackedLink";
import { MobileNav } from "./MobileNav";
import { HeaderScroll } from "./HeaderScroll";
import { LogoMark } from "./LogoMark";
import { formatPhone } from "@/lib/phone";
import type { SiteSettings } from "@prisma/client";

const telHref = (p: string) => "tel:+" + p.replace(/\D/g, "").replace(/^8/, "7");

export function Header({ s }: { s: SiteSettings }) {
  return (
    <header id="site-header" className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <HeaderScroll />
      <div className="container-x flex min-h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.logoUrl ? <img src={s.logoUrl} alt={s.companyName} className="h-9 w-auto" /> : <span aria-hidden className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-white"><LogoMark className="h-7 w-7" /></span>}
          <span>{s.logoText}</span>
        </Link>
        <nav aria-label="Основная" className="hidden gap-6 text-sm font-medium md:flex">
          <Link href="/uslugi" className="hover:text-ice">Услуги</Link>
          <Link href="/#how" className="hover:text-ice">Как мы работаем</Link>
          <Link href="/kontakty" className="hover:text-ice">Контакты</Link>
        </nav>
        <div className="flex items-center gap-3">
          <TrackedLink goal="phone_click" href={telHref(s.phone)} className="hidden text-sm font-semibold text-navy sm:block">{s.phone}</TrackedLink>
          <div className="hidden md:block"><Link href="/zayavka" className="btn btn-primary !min-h-10 !px-4 !py-2 text-sm">Оставить заявку</Link></div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="mt-20 bg-graphite pb-20 text-slate-200 md:pb-0">
      <div className="container-x grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">{s.companyName}</p>
          <p className="mt-2 text-sm">{s.region}</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-white">Контакты</p>
          <TrackedLink goal="phone_click" href={telHref(s.phone)} className="block py-1">{s.phone}</TrackedLink>
          {s.email && <a href={`mailto:${s.email}`} className="block py-1">{s.email}</a>}
          {s.telegramUrl && <TrackedLink goal="messenger_click" href={s.telegramUrl} target="_blank" rel="noopener" className="block py-1">Telegram</TrackedLink>}
          {s.whatsappUrl && <TrackedLink goal="messenger_click" href={s.whatsappUrl} target="_blank" rel="noopener" className="block py-1">WhatsApp</TrackedLink>}
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-white">Разделы</p>
          <Link href="/uslugi" className="block py-1">Услуги</Link>
          <Link href="/zayavka" className="block py-1">Оставить заявку</Link>
          <Link href="/politika-konfidencialnosti" className="block py-1">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}

export { telHref };
export const phoneLabel = formatPhone;
