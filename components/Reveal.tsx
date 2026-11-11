"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Лёгкое появление блока при прокрутке. С `stagger` дочерние элементы появляются по очереди.
 * При prefers-reduced-motion анимации нет, контент виден сразу.
 */
export function Reveal({ children, className, stagger = false }: { children: React.ReactNode; className?: string; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    const targets = stagger ? Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]")) : [el];
    if (targets.length === 0) return;
    const tween = gsap.fromTo(targets, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: stagger ? 0.07 : 0, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [stagger]);
  return <div ref={ref} className={className}>{children}</div>;
}
