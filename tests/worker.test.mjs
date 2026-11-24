// Проверка Telegram-бота (Cloudflare Worker) на моках fetch и KV. Сценарии из задания (1–7) + настройка вебхука.
import { describe, it, expect, beforeEach, vi } from "vitest";
import worker from "../bot-cloudflare/worker.js";

const GROUP = "-1001234567890";
const TOKEN = "lead_42_AAAAAAAAAAAA"; // формат токена: lead_<номер>_<12 символов подписи>
const VALID = new Set([TOKEN]);
let calls, kv, env, threadSeq;

const kvMock = () => {
  const m = new Map();
  return { m, get: async (k) => m.get(k) ?? null, put: async (k, v) => void m.set(k, String(v)), delete: async (k) => void m.delete(k) };
};

beforeEach(() => {
  calls = [];
  threadSeq = 100;
  kv = kvMock();
  env = { BOT_TOKEN: "BT", WEBHOOK_SECRET: "WS", GROUP_ID: GROUP, CONSENT_URL: "https://site.test/soglasie", SITE_URL: "https://site.test", PULL_SECRET: "PS", KV: kv };
  vi.stubGlobal("fetch", async (url, init = {}) => {
    const u = String(url);
    if (u.startsWith("https://api.telegram.org/botBT/")) {
      const method = u.split("/").pop();
      const body = JSON.parse(init.body);
      calls.push({ method, body });
      const result = method === "createForumTopic" ? { message_thread_id: ++threadSeq } : { message_id: 1 };
      return new Response(JSON.stringify({ ok: true, result }), { status: 200 });
    }
    if (u.startsWith("https://site.test/api/lead/pull")) {
      const token = new URL(u).searchParams.get("token");
      const secretOk = init.headers?.["x-pull-secret"] === "PS";
      if (!secretOk) return new Response("{}", { status: 403 });
      if (!VALID.has(token)) return new Response("{}", { status: 404 });
      return new Response(JSON.stringify({ ok: true, name: "Иван", contact: "+7 (900) 123-45-67", project: "roof", message: "Нужно срочно", quiz: "Адрес: Москва, Тверская 1" }), { status: 200 });
    }
    throw new Error("неожиданный запрос " + u);
  });
});

const send = (update, headers = { "X-Telegram-Bot-Api-Secret-Token": "WS" }) =>
  worker.fetch(new Request("https://w.test/hook", { method: "POST", headers, body: JSON.stringify(update) }), env);
const client = (text, id = 777) => ({ message: { message_id: 5, chat: { id: id, type: "private" }, from: { id, first_name: "Анна", username: "anna" }, text } });
const to = (m) => calls.filter((c) => c.method === m);

describe("бот-посредник", () => {
  it("1) /start <услуга> без согласия → просит согласие, тему не создаёт", async () => {
    await send(client("/start roof"));
    expect(to("createForumTopic")).toHaveLength(0);
    const m = to("sendMessage")[0].body;
    expect(m.chat_id).toBe(777);
    expect(JSON.stringify(m.reply_markup)).toContain("agree");
    expect(JSON.stringify(m.reply_markup)).toContain("https://site.test/soglasie");
    expect(kv.m.get("p:777")).toBe("roof");
  });

  it("2) «Согласен(на)» → тема и «Выбранная на сайте услуга»", async () => {
    await send(client("/start roof"));
    calls.length = 0;
    await send({ callback_query: { id: "cb1", data: "agree", from: { id: 777, first_name: "Анна" }, message: { chat: { id: 777 } } } });
    expect(to("answerCallbackQuery")).toHaveLength(1);
    expect(to("createForumTopic")).toHaveLength(1);
    const inGroup = to("sendMessage").filter((c) => c.body.chat_id === GROUP).map((c) => c.body.text);
    expect(inGroup.some((t) => t.includes("Выбранная на сайте услуга: Очистка крыши"))).toBe(true);
    expect(to("sendMessage").some((c) => c.body.chat_id === 777 && c.body.text.includes("Вы выбрали услугу"))).toBe(true);
    expect(kv.m.has("a:777")).toBe(true);
  });

  it("3) /start lead_… с рабочим pull → тема, карточка, ответ клиенту, согласие проставлено", async () => {
    await send(client(`/start ${TOKEN}`));
    expect(to("createForumTopic")).toHaveLength(1);
    const card = to("sendMessage").find((c) => c.body.chat_id === GROUP && c.body.text.includes("Заявка с сайта")).body;
    expect(card.message_thread_id).toBe(101);
    for (const part of ["Имя: Иван", "Контакт: +7 (900) 123-45-67", "Услуга: Очистка крыши", "Детали: Адрес: Москва, Тверская 1", "Комментарий: Нужно срочно"]) expect(card.text).toContain(part);
    expect(to("sendMessage").some((c) => c.body.chat_id === 777 && c.body.text.includes("Заявка получена"))).toBe(true);
    expect(kv.m.has("a:777")).toBe(true); // согласие дано на сайте — повторно не просим
    expect(to("sendMessage").some((c) => JSON.stringify(c.body).includes("agree"))).toBe(false);
  });

  it("4) повторный /start с тем же токеном → «уже у нас», без дубля темы", async () => {
    await send(client(`/start ${TOKEN}`));
    calls.length = 0;
    await send(client(`/start ${TOKEN}`));
    expect(to("createForumTopic")).toHaveLength(0);
    expect(to("sendMessage").some((c) => c.body.text.includes("Ваша заявка уже у нас"))).toBe(true);
    expect(to("sendMessage").filter((c) => c.body.chat_id === GROUP)).toHaveLength(0);
  });

  it("5) неверный токен → обычный поток с согласием", async () => {
    await send(client("/start lead_43_BBBBBBBBBBBB", 888));
    expect(to("createForumTopic")).toHaveLength(0);
    expect(JSON.stringify(to("sendMessage")[0].body.reply_markup)).toContain("agree");
    expect(kv.m.has("a:888")).toBe(false);
  });

  it("6) менеджер пишет в теме → клиенту уходит copyMessage; сообщение с точки не уходит", async () => {
    await send(client(`/start ${TOKEN}`));
    calls.length = 0;
    const mgr = (text) => ({ message: { message_id: 9, message_thread_id: 101, chat: { id: Number(GROUP), type: "supergroup" }, from: { id: 1, is_bot: false }, text } });
    await send(mgr("Здравствуйте, уточните адрес"));
    const copy = to("copyMessage");
    expect(copy).toHaveLength(1);
    expect(copy[0].body.chat_id).toBe(777);
    await send(mgr(".заметка для своих"));
    expect(to("copyMessage")).toHaveLength(1); // новых не прибавилось
    await send({ message: { message_id: 10, message_thread_id: 101, chat: { id: Number(GROUP), type: "supergroup" }, from: { id: 2, is_bot: true }, text: "бот" } });
    expect(to("copyMessage")).toHaveLength(1);
  });

  it("клиент после согласия пишет → сообщение копируется в его тему", async () => {
    await send(client(`/start ${TOKEN}`));
    calls.length = 0;
    await send(client("Есть ещё вопрос"));
    const copy = to("copyMessage")[0].body;
    expect(copy.chat_id).toBe(GROUP);
    expect(copy.message_thread_id).toBe(101);
  });

  it("7) /hook без секретного заголовка → 403, обработка не запускается", async () => {
    const r1 = await send(client("/start roof"), {});
    expect(r1.status).toBe(403);
    const r2 = await send(client("/start roof"), { "X-Telegram-Bot-Api-Secret-Token": "wrong" });
    expect(r2.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it("/setup работает только с секретом и ставит вебхук с secret_token", async () => {
    const bad = await worker.fetch(new Request("https://w.test/setup?secret=nope"), env);
    expect(bad.status).toBe(403);
    const ok = await worker.fetch(new Request("https://w.test/setup?secret=WS"), env);
    expect(ok.status).toBe(200);
    const hook = to("setWebhook")[0].body;
    expect(hook.url).toBe("https://w.test/hook");
    expect(hook.secret_token).toBe("WS");
  });
});
