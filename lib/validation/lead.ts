import { z } from "zod";
import { FIELDS, ORDER_KINDS, CONTACT_METHODS, SERVICE_CHOICES, type FormKey } from "@/lib/serviceFields";
import { normalizePhone } from "@/lib/phone";

const keys = SERVICE_CHOICES.map((s) => s.key) as [FormKey, ...FormKey[]];
const str = (max: number) => z.string().trim().max(max);

export const leadSchema = z.object({
  services: z.array(z.enum(keys)).min(1, "Выберите хотя бы одну услугу").max(8),
  params: z.record(z.string(), z.record(z.string(), z.string().max(500))).default({}),
  city: str(120).optional(),
  street: str(200).optional(),
  accessNotes: str(1000).optional(),
  orderKind: z.enum(ORDER_KINDS as [string, ...string[]]).optional().or(z.literal("")),
  desiredAt: str(60).optional(),
  name: str(100).min(2, "Укажите имя"),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = normalizePhone(v);
      if (!n) {
        ctx.addIssue({ code: "custom", message: "Введите корректный номер телефона" });
        return z.NEVER;
      }
      return n;
    }),
  organization: str(150).optional(),
  email: z.string().trim().email("Некорректный e-mail").max(150).optional().or(z.literal("")),
  contactMethod: z.enum(CONTACT_METHODS as [string, ...string[]]).optional().or(z.literal("")),
  comment: str(3000).optional(),
  consent: z.literal(true, { message: "Необходимо согласие на обработку персональных данных" }),
  idempotencyKey: z.string().min(8).max(64),
  // антиспам
  website: z.string().max(0).optional(), // honeypot
  startedAt: z.number().int(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Оставляет в params только известные поля выбранных услуг. */
export function sanitizeParams(services: FormKey[], params: Record<string, Record<string, string>>) {
  const out: Record<string, Record<string, string>> = {};
  for (const s of services) {
    const allowed = new Set(FIELDS[s].map((f) => f.name));
    const src = params[s] ?? {};
    const row: Record<string, string> = {};
    for (const [k, v] of Object.entries(src)) {
      if (!allowed.has(k) || v === "") continue;
      const def = FIELDS[s].find((f) => f.name === k)!;
      if (def.type === "select" && !def.options!.includes(v)) continue;
      if (def.type === "number" && v !== "unknown" && !/^\d{1,9}([.,]\d{1,2})?$/.test(v)) continue;
      row[k] = v;
    }
    if (Object.keys(row).length) out[s] = row;
  }
  return out;
}
