"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Декоративный элемент, который медленно смещается и поворачивается при прокрутке. */
export function Parallax({ children, className, y = 120, rotate = 25 }: { children: React.ReactNode; className?: string; y?: number; rotate?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.to(el, { y, rotate, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [y, rotate]);
  return <div ref={ref} aria-hidden className={className}>{children}</div>;
}
