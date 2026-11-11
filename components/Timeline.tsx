"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Этапы работы: линия прорисовывается по мере прокрутки, пройденные шаги подсвечиваются.
 * Разметка шагов: [data-step]; линии: [data-line-h] (десктоп) и [data-line-v] (телефон).
 */
export function Timeline({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-line-h],[data-line-v]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      steps.forEach((s) => s.classList.add("is-active"));
      lines.forEach((l) => (l.style.transform = "none"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 55%",
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        lines.forEach((l) => (l.style.transform = l.hasAttribute("data-line-h") ? `scaleX(${p})` : `scaleY(${p})`));
        steps.forEach((s, i) => s.classList.toggle("is-active", p >= (steps.length > 1 ? i / (steps.length - 1) : 0) - 0.03));
      },
    });
    return () => st.kill();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
