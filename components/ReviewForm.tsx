"use client";
import { useState } from "react";
import Link from "next/link";
import { SERVICE_CHOICES } from "@/lib/serviceFields";

/** Форма отзыва: оценка, имя, текст. Отзыв сначала проверяет менеджер, потом он появляется на сайте. */
export function ReviewForm() {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [startedAt] = useState(() => Date.now());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const er: Record<string, string> = {};
    if (author.trim().length < 2) er.author = "Укажите имя";
    if (!rating) er.rating = "Поставьте оценку";
    if (text.trim().length < 20) er.text = "Напишите хотя бы пару предложений (от 20 символов)";
    if (!consent) er.consent = "Необходимо согласие на обработку данных и публикацию отзыва";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ author, rating, text, serviceKey, contact: contact || undefined, consent: true, website, startedAt }) });
      const j = await r.json();
      if (r.ok && j.ok) setDone(true);
      else setErrors({ form: j.error ?? "Не удалось отправить отзыв", ...(j.fields ?? {}) });
    } catch {
      setErrors({ form: "Нет соединения. Повторите попытку." });
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div role="status" className="rounded-2xl bg-ice-50 p-8 text-center">
        <svg aria-hidden viewBox="0 0 52 52" className="draw-check mx-auto mb-4 h-14 w-14 text-ice" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="26" cy="26" r="23" /><path d="m15 27 8 8 15-17" /></svg>
        <h3 className="text-xl font-bold text-navy">Спасибо за отзыв!</h3>
        <p className="mt-2 text-slate-600">Он отправлен на проверку и появится на сайте после модерации.</p>
      </div>
    );

  const shown = hover || rating;
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-navy">Оставить отзыв</h3>
        <p className="mt-1 text-sm text-slate-600">Отзыв появится на сайте после проверки менеджером.</p>
      </div>

      <fieldset>
        <legend className="label">Ваша оценка *</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <label key={i} className="cursor-pointer p-1" onMouseEnter={() => setHover(i)}>
              <input type="radio" name="rating" value={i} checked={rating === i} onChange={() => setRating(i)} className="peer sr-only" aria-label={`${i} из 5`} />
              <svg aria-hidden viewBox="0 0 24 24" className={`h-9 w-9 transition-transform peer-focus-visible:scale-110 peer-focus-visible:drop-shadow ${i <= shown ? "text-amber-400" : "text-slate-300"}`} fill={i <= shown ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>
            </label>
          ))}
        </div>
        {errors.rating && <p role="alert" className="mt-1 text-sm text-red-700">{errors.rating}</p>}
      </fieldset>

      <div>
        <label className="label" htmlFor="rv-author">Имя *</label>
        <input id="rv-author" className="field" autoComplete="given-name" value={author} onChange={(e) => setAuthor(e.target.value)} aria-invalid={!!errors.author} />
        {errors.author && <p role="alert" className="mt-1 text-sm text-red-700">{errors.author}</p>}
      </div>
      <div>
        <label className="label" htmlFor="rv-service">Какая услуга (необязательно)</label>
        <select id="rv-service" className="field" value={serviceKey} onChange={(e) => setServiceKey(e.target.value)}>
          <option value="">Не выбрано</option>
          {SERVICE_CHOICES.filter((s) => s.key !== "other").map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="rv-text">Отзыв *</label>
        <textarea id="rv-text" rows={5} className="field" value={text} onChange={(e) => setText(e.target.value)} maxLength={1500} aria-invalid={!!errors.text} />
        <p className="mt-1 text-xs text-slate-500">{text.trim().length} / 1500</p>
        {errors.text && <p role="alert" className="mt-1 text-sm text-red-700">{errors.text}</p>}
      </div>
      <div>
        <label className="label" htmlFor="rv-contact">Телефон или e-mail (необязательно)</label>
        <input id="rv-contact" className="field" value={contact} onChange={(e) => setContact(e.target.value)} />
        <p className="mt-1 text-xs text-slate-500">Только для проверки отзыва менеджером, на сайте не показывается.</p>
      </div>
      <div aria-hidden className="absolute -left-[9999px]"><label>Сайт<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Даю <Link href="/soglasie" target="_blank" className="underline">согласие на обработку персональных данных</Link> и на публикацию отзыва на сайте (имя без фамилии).</span>
      </label>
      {errors.consent && <p role="alert" className="text-sm text-red-700">{errors.consent}</p>}
      {errors.form && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{errors.form}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? "Отправляем…" : "Отправить отзыв"}</button>
    </form>
  );
}
