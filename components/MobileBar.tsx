"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrackedLink } from "./TrackedLink";

/** Нижняя панель на мобильных: быстрый звонок и заявка. На странице заявки не нужна. */
export function MobileBar({ phoneHref }: { phoneHref: string }) {
  const path = usePathname();
  if (path.startsWith("/zayavka")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-2 backdrop-blur md:hidden">
      <TrackedLink goal="phone_click" href={phoneHref} className="btn btn-secondary !min-h-11 !py-2">Позвонить</TrackedLink>
      <Link href="/zayavka" className="btn btn-primary !min-h-11 !py-2">Оставить заявку</Link>
    </div>
  );
}
