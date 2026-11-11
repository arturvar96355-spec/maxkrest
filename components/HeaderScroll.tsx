"use client";
import { useEffect } from "react";

/** Добавляет тень шапке после прокрутки страницы. */
export function HeaderScroll() {
  useEffect(() => {
    const h = document.getElementById("site-header");
    const on = () => h?.toggleAttribute("data-scrolled", window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return null;
}
