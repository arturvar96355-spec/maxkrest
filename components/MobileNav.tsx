"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "/uslugi", label: "Услуги" },
  { href: "/#how", label: "Как мы работаем" },
  { href: "/kontakty", label: "Контакты" },
  { href: "/zayavka", label: "Оставить заявку" },
];

/** Меню для телефонов: кнопка-«бургер» и выезжающая панель. */
export function MobileNav({ services = [] }: { services?: { slug: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <div className="md:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Закрыть меню" : "Открыть меню"} onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200">
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Мобильное меню" className="absolute inset-x-0 top-full z-20 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-lg font-medium hover:bg-ice-50">{l.label}</Link>
                {l.href === "/uslugi" && services.length > 0 && (
                  <ul className="mb-1 ml-3 border-l border-slate-200 pl-3">
                    {services.map((sv) => (
                      <li key={sv.slug}><Link href={`/uslugi/${sv.slug}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-base text-slate-700 hover:bg-ice-50">{sv.title}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
