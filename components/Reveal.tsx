"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Лёгкое появление блока при прокрутке. Без анимации при prefers-reduced-motion. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    const tween = gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
