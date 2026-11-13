"use client";
import { useState } from "react";
import Link from "next/link";
import { formatPhoneInput } from "@/lib/phoneMask";
import { reachGoal } from "./goals";

/**
 * Быстрая форма «Заказать звонок»: имя + телефон, остальное уточнит специалист.
 * variant="card" — вертикальная карточка, variant="bar" — горизонтальная панель (первый экран).
 */
export function CallbackForm({ variant = "card" }: { variant?: "card" | "bar" }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [key] = useState(() => crypto.randomUUID());
  const bar = variant === "bar";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (name.trim().length < 2) return setErr("Укажите имя");
    if (phone.replace(/\D/g, "").length !== 11) return setErr("Введите номер полностью");
    if (!consent) return setErr("Нужно согласие на обработку персональных данных");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.set("data", JSON.stringify({
      services: ["other"], params: { other: { describe: "Заказ обратного звонка" } },
      comment: "Заказ звонка (быстрая форма)", name, phone, consent: true, idempotencyKey: key, startedAt,
    }));
    try {
      const r = await fetch("/api/leads", { method: "POST", body: fd });
      const j = await r.json();
      if (r.ok && j.ok) { reachGoal("lead_submit"); setDone(j.number); }
      else setErr(j.fields?.phone ?? j.error ?? "Не удалось отправить");
    } catch {
      setErr("Нет соединения. Повторите попытку.");
    } finally {
      setBusy(false);
    }
  }

  const wrap = bar ? "rounded-2xl border border-white/15 bg-navy-900/60 p-4 text-white shadow-2xl backdrop-blur-md sm:p-5" : "rounded-2xl bg-white p-6 text-graphite shadow-xl";
  if (done !== null)
    return (
      <div role="status" className={wrap}>
        <p className={`text-xl font-bold ${bar ? "text-white" : "text-navy"}`}>Спасибо! Мы перезвоним.</p>
        {done > 0 && <p className="mt-1">Заявка №{done}</p>}
        <p className={`mt-2 text-sm ${bar ? "text-slate-300" : "text-slate-600"}`}>Наш специалист свяжется с вами для уточнения деталей.</p>
      </div>
    );

  const nameField = (
    <div><label className={`label ${bar ? "!text-slate-200" : ""}`} htmlFor="cb-name">Имя</label><input id="cb-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
  );
  const phoneField = (
    <div><label className={`label ${bar ? "!text-slate-200" : ""}`} htmlFor="cb-phone">Телефон</label><input id="cb-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (900) 000-00-00" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} /></div>
  );
  const consentField = (
    <label className={`flex items-start gap-2 text-xs ${bar ? "text-slate-300" : "text-slate-600"}`}>
      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
      <span>Согласен(на) на обработку персональных данных, <Link href="/politika-konfidencialnosti" target="_blank" className="underline">политика</Link>.</span>
    </label>
  );

  if (bar)
    return (
      <form onSubmit={submit} noValidate className={wrap}>
        <div className="grid items-end gap-3 lg:grid-cols-[1fr_1.2fr_1.2fr_auto]">
          <div className="lg:pb-2">
            <p className="text-lg font-bold">Заказать звонок</p>
            <p className="text-sm text-slate-300">Перезвоним и уточним детали</p>
          </div>
          {nameField}
          {phoneField}
          <button disabled={busy} className="btn btn-accent disabled:opacity-60">{busy ? "Отправляем…" : "Перезвоните мне"}</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          {consentField}
          <Link href="/zayavka" className="text-xs text-slate-300 underline">Нужно описать объект подробнее? Полная заявка</Link>
        </div>
        {err && <p role="alert" className="mt-2 text-sm text-red-300">{err}</p>}
      </form>
    );

  return (
    <form onSubmit={submit} noValidate className={wrap}>
      <p className="text-xl font-bold text-navy">Заказать звонок</p>
      <p className="mt-1 text-sm text-slate-600">Оставьте номер — перезвоним и уточним детали.</p>
      <div className="mt-4 space-y-3">
        {nameField}
        {phoneField}
        {consentField}
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? "Отправляем…" : "Перезвоните мне"}</button>
        <p className="text-center text-xs text-slate-500">Нужно описать объект подробнее? <Link href="/zayavka" className="underline">Полная заявка</Link></p>
      </div>
    </form>
  );
}
