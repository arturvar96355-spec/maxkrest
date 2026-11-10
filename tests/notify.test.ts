import { describe, it, expect, vi, beforeEach } from "vitest";

const lead = { id: "l1", number: 5, name: "Иван", phone: "+79001234567", services: ["roof"], city: "Москва", street: "Тверская 1", notifyState: "PENDING", notifyAttempts: 0 };
const update = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    lead: { findUnique: vi.fn(async () => lead), update: (a: unknown) => update(a), findMany: vi.fn(async () => [{ id: "l1" }]) },
    siteSettings: { findUnique: vi.fn(async () => ({ tgChatId: "123" })) },
  },
}));

import { notifyLead } from "@/lib/telegram";

describe("notifyLead", () => {
  beforeEach(() => { update.mockClear(); process.env.TELEGRAM_BOT_TOKEN = "t"; vi.spyOn(console, "error").mockImplementation(() => {}); });

  it("при сбое Telegram оставляет заявку PENDING и откладывает повтор", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 502 })));
    expect(await notifyLead("l1")).toBe(false);
    const data = update.mock.calls[0][0].data;
    expect(data.notifyState).toBe("PENDING");
    expect(data.notifyAttempts).toBe(1);
    expect(data.notifyNextAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("при успехе помечает SENT", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    expect(await notifyLead("l1")).toBe(true);
    expect(update.mock.calls[0][0].data.notifyState).toBe("SENT");
  });
});
