"use client";
import { useState } from "react";
import Link from "next/link";
import { formatPhoneInput } from "@/lib/phoneMask";
import { reachGoal } from "./goals";

/** Быстрая форма «Заказать звонок»: имя + телефон, остальное уточнит специалист. */
export function CallbackForm({ dark = false }: { dark?: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [key] = useState(() => crypto.randomUUID());

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

  const box = dark ? "bg-white text-graphite" : "bg-ice-50 text-graphite";
  if (done !== null)
    return (
      <div role="status" className={`rounded-2xl p-6 ${box}`}>
        <p className="text-xl font-bold text-navy">Спасибо! Мы перезвоним.</p>
        {done > 0 && <p className="mt-1">Заявка №{done}</p>}
        <p className="mt-2 text-sm text-slate-600">Наш специалист свяжется с вами для уточнения деталей.</p>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate className={`rounded-2xl p-6 shadow-xl ${box}`}>
      <p className="text-xl font-bold text-navy">Заказать звонок</p>
      <p className="mt-1 text-sm text-slate-600">Оставьте номер — перезвоним и уточним детали.</p>
      <div className="mt-4 space-y-3">
        <div><label className="label" htmlFor="cb-name">Имя</label><input id="cb-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="label" htmlFor="cb-phone">Телефон</label><input id="cb-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (900) 000-00-00" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} /></div>
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>Согласен(на) на обработку персональных данных, <Link href="/politika-konfidencialnosti" target="_blank" className="underline">политика</Link>.</span>
        </label>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? "Отправляем…" : "Перезвоните мне"}</button>
        <p className="text-center text-xs text-slate-500">Нужно описать объект подробнее? <Link href="/zayavka" className="underline">Полная заявка</Link></p>
      </div>
    </form>
  );
}
