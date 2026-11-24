import { describe, it, expect, afterEach } from "vitest";
import { makeStartParam, parseStartParam, safeEqual, botLinkFor } from "@/lib/leadToken";
import { leadToPull } from "@/lib/leadPull";

const SECRET = "0123456789abcdef0123456789abcdef";

describe("подпись токена заявки", () => {
  it("туда-обратно работает, подделка и чужой секрет отклоняются", () => {
    const p = makeStartParam(SECRET, 42);
    expect(p).toMatch(/^lead_42_[A-Za-z0-9_-]{12}$/);
    expect(parseStartParam(SECRET, p)).toBe(42);
    expect(parseStartParam(SECRET, p.replace("lead_42", "lead_43"))).toBeNull(); // чужой номер с той же подписью
    expect(parseStartParam("another-secret-another-secret-xx", p)).toBeNull();
    expect(parseStartParam(SECRET, "lead_42_short")).toBeNull();
    expect(parseStartParam(SECRET, "roof")).toBeNull();
  });
  it("safeEqual сравнивает секреты любой длины", () => {
    expect(safeEqual("a", "a")).toBe(true);
    expect(safeEqual("a", "ab")).toBe(false);
    expect(safeEqual("", SECRET)).toBe(false);
  });
});

describe("ссылка на бота", () => {
  const old = { ...process.env };
  afterEach(() => { process.env = { ...old }; });
  it("формируется только при BOT_USERNAME и достаточно длинном LEAD_PULL_SECRET", () => {
    delete process.env.BOT_USERNAME; delete process.env.LEAD_PULL_SECRET;
    expect(botLinkFor(5)).toBeNull();
    process.env.BOT_USERNAME = "@royal_snow_bot"; process.env.LEAD_PULL_SECRET = "short";
    expect(botLinkFor(5)).toBeNull();
    process.env.LEAD_PULL_SECRET = SECRET;
    expect(botLinkFor(5)).toBe(`https://t.me/royal_snow_bot?start=${makeStartParam(SECRET, 5)}`);
    expect(botLinkFor(0)).toBeNull();
  });
});

describe("карточка заявки для бота", () => {
  it("собирает имя, контакт, первую услугу и детали", () => {
    const lead = { name: "Иван", phone: "+79001234567", email: "i@x.ru", contactMethod: "Telegram", services: ["roof", "removal"], organization: null, city: "Москва", street: "Тверская, 1", accessNotes: null, orderKind: "Срочная заявка", desiredAt: null, comment: "Срочно", params: { roof: { roofType: "Плоская", roofArea: "120" } } };
    const r = leadToPull(lead as never);
    expect(r.name).toBe("Иван");
    expect(r.project).toBe("roof");
    expect(r.contact).toContain("+7 (900) 123-45-67");
    expect(r.contact).toContain("Telegram");
    expect(r.message).toBe("Срочно");
    for (const part of ["Адрес: Москва, Тверская, 1", "Тип крыши: Плоская", "Услуги:"]) expect(r.quiz).toContain(part);
  });
});
