"use client";
import Link from "next/link";

/** Карточка с мягкой подсветкой под курсором (только на устройствах с мышью). */
export function SpotlightCard({ href, className = "", children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-reveal
      className={`spot ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </Link>
  );
}
