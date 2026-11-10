import { describe, it, expect } from "vitest";
import { normalizePhone } from "@/lib/phone";
import { leadSchema, sanitizeParams } from "@/lib/validation/lead";
import { sniffImage } from "@/lib/uploads";
import { FIELDS, SERVICE_CHOICES } from "@/lib/serviceFields";
import { buildMessage } from "@/lib/telegram";

const base = {
  services: ["roof"], params: {}, name: "Иван", phone: "+7 (900) 123-45-67", consent: true as const,
  idempotencyKey: "abcdefgh12", startedAt: 1,
};

describe("phone", () => {
  it("нормализует форматы", () => {
    expect(normalizePhone("8 900 123 45 67")).toBe("+79001234567");
    expect(normalizePhone("+7 (900) 123-45-67")).toBe("+79001234567");
    expect(normalizePhone("12345")).toBeNull();
  });
});

describe("leadSchema", () => {
  it("принимает минимальную заявку (только имя, телефон, услуга, согласие)", () => {
    const r = leadSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("+79001234567");
  });
  it("требует согласие, телефон и услугу", () => {
    expect(leadSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, phone: "123" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, services: [] }).success).toBe(false);
  });
  it("отклоняет заполненный honeypot", () => {
    expect(leadSchema.safeParse({ ...base, website: "spam" }).success).toBe(false);
  });
});

describe("sanitizeParams", () => {
  it("оставляет только поля выбранных услуг и валидные значения", () => {
    const out = sanitizeParams(["roof"], {
      roof: { roofType: "Плоская", roofArea: "120", hack: "x", buildingHeight: "Выдумка" },
      parking: { area: "5" },
    });
    expect(out).toEqual({ roof: { roofType: "Плоская", roofArea: "120" } });
  });
  it("допускает «не знаю» для площади", () => {
    expect(sanitizeParams(["parking"], { parking: { area: "unknown" } })).toEqual({ parking: { area: "unknown" } });
  });
  it("для каждой услуги есть описание полей", () => {
    for (const s of SERVICE_CHOICES) expect(FIELDS[s.key].length).toBeGreaterThan(0);
  });
});

describe("sniffImage", () => {
  it("распознаёт JPEG/PNG по сигнатуре и отклоняет прочее", () => {
    const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(20)]);
    expect(sniffImage(jpg)?.ext).toBe("jpg");
    expect(sniffImage(Buffer.from("<script>alert(1)</script>"))).toBeNull();
  });
});

describe("telegram message", () => {
  it("содержит номер, имя, телефон, услугу, адрес и ссылку, и экранирует HTML", () => {
    const m = buildMessage({ id: "abc", number: 7, name: "<b>Ив</b>", phone: "+79001234567", services: ["roof"], city: "Москва", street: "Тверская, 1" });
    expect(m).toContain("№7");
    expect(m).toContain("&lt;b&gt;");
    expect(m).toContain("+7 (900) 123-45-67");
    expect(m).toContain("Москва, Тверская, 1");
    expect(m).toContain("/admin/zayavki/abc");
  });
});
