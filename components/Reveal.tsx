"use client";
import { useEffect, useRef } from "react";

/**
 * Появление блока (или дочерних [data-reveal] по очереди) при прокрутке.
 * IntersectionObserver + CSS-переходы: дёшево для основного потока. Блоки, уже видимые на первом экране,
 * не скрываются. При prefers-reduced-motion анимации нет.
 */
export function Reveal({ children, className, stagger = false }: { children: React.ReactNode; className?: string; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const all = stagger ? Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]")) : [el];
    const limit = window.innerHeight * 0.92;
    const targets = all.filter((t) => t.getBoundingClientRect().top > limit);
    if (targets.length === 0) return;
    targets.forEach((t, i) => {
      t.classList.add("rv");
      t.style.transitionDelay = stagger ? `${(i % 6) * 70}ms` : "0ms";
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const t = e.target as HTMLElement;
          t.classList.add("rv-in");
          io.unobserve(t);
          // после появления возвращаем элементу его собственные переходы (hover и т.п.)
          setTimeout(() => { t.classList.remove("rv", "rv-in"); t.style.transitionDelay = ""; }, 1100);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [stagger]);
  return <div ref={ref} className={className}>{children}</div>;
}
