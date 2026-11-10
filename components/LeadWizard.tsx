"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { SERVICE_CHOICES, FIELDS, ORDER_KINDS, CONTACT_METHODS, type FormKey, type FieldDef } from "@/lib/serviceFields";
import { reachGoal } from "./goals";

const STEPS = ["Услуга", "Объект", "Адрес и сроки", "Контакты"];
type Params = Record<string, Record<string, string>>;

function formatPhoneInput(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += " (" + p[0] + (p[0].length === 3 ? ")" : "");
  if (p[1]) out += " " + p[1];
  if (p[2]) out += "-" + p[2];
  if (p[3]) out += "-" + p[3];
  return out;
}

export function LeadWizard({ initialService, callback }: { initialService?: FormKey; callback?: boolean }) {
  const [step, setStep] = useState(callback ? 3 : 0);
  const [services, setServices] = useState<FormKey[]>(initialService ? [initialService] : callback ? ["other"] : []);
  const [params, setParams] = useState<Params>({});
  const [f, setF] = useState({ city: "", street: "", accessNotes: "", orderKind: "", desiredAt: "", name: "", phone: "", organization: "", email: "", contactMethod: "Телефон", comment: "", consent: false, website: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [idemKey] = useState(() => crypto.randomUUID());

  const setField = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const setParam = (s: FormKey, k: string, v: string) => setParams((p) => ({ ...p, [s]: { ...p[s], [k]: v } }));
  const toggle = (k: FormKey) => setServices((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const labelOf = useMemo(() => Object.fromEntries(SERVICE_CHOICES.map((s) => [s.key, s.label])), []);

  function validate(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0 && services.length === 0) e.services = "Выберите хотя бы одну услугу";
    if (s === 3) {
      if (f.name.trim().length < 2) e.name = "Укажите имя";
      if (f.phone.replace(/\D/g, "").length !== 11) e.phone = "Введите номер полностью, например +7 (900) 123-45-67";
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Некорректный e-mail";
      if (!f.consent) e.consent = "Необходимо согласие на обработку персональных данных";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => validate(step) && setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  function addFiles(list: FileList | null) {
    if (!list) return;
    const ok = Array.from(list).filter((x) => x.size <= 8 * 1024 * 1024 && /^image\//.test(x.type || "image/heic"));
    if (ok.length < list.length) setErrors((e) => ({ ...e, files: "Часть файлов пропущена: допустимы изображения до 8 МБ" }));
    setFiles((p) => [...p, ...ok].slice(0, 10));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !validate(3)) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("data", JSON.stringify({ ...f, services, params, idempotencyKey: idemKey, startedAt, email: f.email || undefined }));
    files.forEach((x) => fd.append("files", x));
    try {
      const res = await fetch("/api/leads", { method: "POST", body: fd });
      const j = await res.json();
      if (res.ok && j.ok) {
        reachGoal("lead_submit" as never);
        setDone(j.number);
      } else {
        setErrors({ form: j.error ?? "Не удалось отправить заявку", ...(j.fields ?? {}) });
      }
    } catch {
      setErrors({ form: "Нет соединения. Проверьте интернет и повторите отправку." });
    } finally {
      setBusy(false);
    }
  }

  if (done !== null)
    return (
      <div role="status" className="rounded-2xl bg-ice-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-navy">Спасибо! Заявка отправлена.</h2>
        {done > 0 && <p className="mt-3 text-lg">Номер вашей заявки: <b>№{done}</b></p>}
        <p className="mt-3">Наш специалист свяжется с вами для уточнения деталей.</p>
        <Link href="/" className="btn btn-primary mt-6">На главную</Link>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl">
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label="Прогресс заполнения">
        <div className="h-full rounded-full bg-ice transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <ol className="mb-6 flex gap-2" aria-label="Шаги заявки">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={`flex-1 rounded-md px-2 py-1 text-center text-xs sm:text-sm ${i === step ? "bg-navy text-white" : i < step ? "bg-ice-50 text-navy" : "bg-slate-100 text-slate-500"}`}>{i + 1}. {s}</li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset>
          <legend className="mb-3 text-lg font-semibold">Что вам нужно? (можно выбрать несколько)</legend>
          <div className="grid gap-2">
            {SERVICE_CHOICES.map((s) => (
              <label key={s.key} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors ${services.includes(s.key) ? "border-navy bg-ice-50" : "border-slate-200 hover:border-ice"}`}>
                <input type="checkbox" className="h-5 w-5" checked={services.includes(s.key)} onChange={() => toggle(s.key)} />
                {s.label}
              </label>
            ))}
          </div>
          {errors.services && <p role="alert" className="mt-2 text-sm text-red-700">{errors.services}</p>}
        </fieldset>
      )}

      {step === 1 && (
        <div className="space-y-8">
          {services.map((s) => (
            <fieldset key={s} className="space-y-4">
              <legend className="mb-2 text-lg font-semibold text-navy">{labelOf[s]}</legend>
              {FIELDS[s].map((fd) => <Dyn key={fd.name} fd={fd} value={params[s]?.[fd.name] ?? ""} onChange={(v) => setParam(s, fd.name, v)} id={`${s}-${fd.name}`} />)}
            </fieldset>
          ))}
          <div>
            <label className="label" htmlFor="photos">Фотографии объекта (необязательно)</label>
            <input id="photos" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={(e) => addFiles(e.target.files)} className="field" />
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {files.map((x, i) => (
                  <li key={i} className="flex justify-between gap-2"><span className="truncate">{x.name}</span><button type="button" className="text-red-700 underline" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>Убрать</button></li>
                ))}
              </ul>
            )}
            {errors.files && <p role="alert" className="mt-1 text-sm text-red-700">{errors.files}</p>}
            <p className="mt-1 text-xs text-slate-500">До 10 файлов, JPG/PNG/WebP/HEIC, до 8 МБ каждый.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Text id="city" label="Город / населённый пункт" value={f.city} onChange={(v) => setField("city", v)} autoComplete="address-level2" />
          <Text id="street" label="Улица, дом, корпус" value={f.street} onChange={(v) => setField("street", v)} autoComplete="street-address" />
          <div>
            <label className="label" htmlFor="access">Дополнительные сведения о расположении или доступе</label>
            <textarea id="access" className="field" rows={3} value={f.accessNotes} onChange={(e) => setField("accessNotes", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="kind">Характер заказа</label>
            <select id="kind" className="field" value={f.orderKind} onChange={(e) => setField("orderKind", e.target.value)}>
              <option value="">Не выбрано</option>
              {ORDER_KINDS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <Text id="when" label="Желаемая дата и время" value={f.desiredAt} onChange={(v) => setField("desiredAt", v)} placeholder="Например, завтра после 14:00" />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Text id="name" label="Имя *" value={f.name} onChange={(v) => setField("name", v)} error={errors.name} autoComplete="name" />
          <Text id="phone" label="Телефон *" value={f.phone} onChange={(v) => setField("phone", formatPhoneInput(v))} error={errors.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (900) 000-00-00" />
          <Text id="org" label="Название организации" value={f.organization} onChange={(v) => setField("organization", v)} autoComplete="organization" />
          <Text id="email" label="E-mail" value={f.email} onChange={(v) => setField("email", v)} error={errors.email} type="email" autoComplete="email" />
          <div>
            <label className="label" htmlFor="cm">Предпочтительный способ связи</label>
            <select id="cm" className="field" value={f.contactMethod} onChange={(e) => setField("contactMethod", e.target.value)}>
              {CONTACT_METHODS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="comment">Комментарий</label>
            <textarea id="comment" className="field" rows={3} value={f.comment} onChange={(e) => setField("comment", e.target.value)} />
          </div>
          {/* honeypot: скрыт от людей */}
          <div aria-hidden className="absolute -left-[9999px]"><label>Сайт<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setField("website", e.target.value)} /></label></div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={f.consent} onChange={(e) => setField("consent", e.target.checked)} />
            <span>Я согласен(на) на обработку персональных данных и ознакомлен(а) с <Link href="/politika-konfidencialnosti" target="_blank" className="underline">политикой обработки персональных данных</Link>.</span>
          </label>
          {errors.consent && <p role="alert" className="text-sm text-red-700">{errors.consent}</p>}
        </div>
      )}

      {errors.form && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{errors.form}</p>}

      <div className="mt-8 flex justify-between gap-3">
        {step > 0 && !callback ? <button type="button" onClick={back} className="btn btn-secondary">Назад</button> : <span />}
        {step < 3 ? (
          <button type="button" onClick={next} className="btn btn-primary">Далее</button>
        ) : (
          <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? "Отправляем…" : "Отправить заявку"}</button>
        )}
      </div>
    </form>
  );
}

function Text({ id, label, value, onChange, error, ...rest }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? id + "-e" : undefined} {...rest} />
      {error && <p id={id + "-e"} role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function Dyn({ fd, value, onChange, id }: { fd: FieldDef; value: string; onChange: (v: string) => void; id: string }) {
  if (fd.type === "select")
    return (
      <div>
        <label className="label" htmlFor={id}>{fd.label}</label>
        <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Не выбрано</option>
          {fd.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    );
  if (fd.type === "number")
    return (
      <div>
        <label className="label" htmlFor={id}>{fd.label}{fd.unit ? `, ${fd.unit}` : ""}</label>
        <input id={id} className="field" inputMode="decimal" value={value === "unknown" ? "" : value} disabled={value === "unknown"} onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))} />
        {fd.unknownOption && (
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={value === "unknown"} onChange={(e) => onChange(e.target.checked ? "unknown" : "")} />Не знаю</label>
        )}
      </div>
    );
  if (fd.type === "textarea")
    return (
      <div>
        <label className="label" htmlFor={id}>{fd.label}</label>
        <textarea id={id} className="field" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  return (
    <div>
      <label className="label" htmlFor={id}>{fd.label}</label>
      <input id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
