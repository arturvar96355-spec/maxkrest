// Приёмочные сценарии ТЗ §15. Требуют запущенный сайт (E2E_BASE_URL), БД и админа:
// ADMIN_EMAIL / ADMIN_PASSWORD должны совпадать с созданным администратором.
import { test, expect } from "@playwright/test";
import path from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "testpassword123";

test("страницы услуг и публичные разделы открываются", async ({ page }) => {
  for (const p of ["/", "/uslugi", "/uslugi/ochistka-krysh", "/kontakty", "/politika-konfidencialnosti"]) {
    const r = await page.goto(p);
    expect(r?.status(), p).toBe(200);
  }
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("форма показывает только релевантные поля", async ({ page }) => {
  await page.goto("/zayavka?service=roof");
  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.getByLabel("Тип крыши")).toBeVisible();
  await expect(page.getByLabel(/Количество парковочных/)).toHaveCount(0);
});

test("валидация: телефон и согласие", async ({ page }) => {
  await page.goto("/zayavka?service=removal");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Далее" }).click();
  await page.fill("#name", "Иван");
  await page.fill("#phone", "123");
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.getByText(/Введите номер полностью/)).toBeVisible();
  await expect(page.getByText(/Необходимо согласие/)).toBeVisible();
});

test("заявка с фото сохраняется, видна в админке; фото закрыты для анонимов", async ({ page, browser, baseURL }) => {
  const dir = path.join(process.cwd(), "tests/e2e/.tmp");
  mkdirSync(dir, { recursive: true });
  const jpg = path.join(dir, "a.jpg");
  writeFileSync(jpg, Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 1)]));

  await page.goto("/zayavka?service=parking");
  await page.getByRole("button", { name: "Далее" }).click();
  await page.setInputFiles("#photos", [jpg, jpg]);
  await page.getByRole("button", { name: "Далее" }).click();
  await page.fill("#city", "Москва");
  await page.fill("#street", "Тестовая, 1");
  await page.getByRole("button", { name: "Далее" }).click();
  await page.fill("#name", "Тест Е2Е");
  await page.fill("#phone", "89005550123");
  await page.getByRole("checkbox", { name: /согласен/ }).check();
  await page.waitForTimeout(3200); // антиспам: минимальное время заполнения
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  const status = page.getByRole("status");
  await expect(status).toContainText("Заявка отправлена");
  const number = (await status.innerText()).match(/№(\d+)/)?.[1];
  expect(number).toBeTruthy();

  // анонимный доступ к админке закрыт
  const adminCtx = await browser.newContext({ baseURL });
  const ap = await adminCtx.newPage();
  await ap.goto("/admin/zayavki");
  await expect(ap).toHaveURL(/\/admin\/login/);

  // вход администратора
  await ap.fill("#email", ADMIN_EMAIL);
  await ap.fill("#password", ADMIN_PASSWORD);
  await ap.getByRole("button", { name: "Войти" }).click();
  await ap.waitForURL("**/admin/zayavki");
  await ap.getByRole("link", { name: number!, exact: true }).first().click();
  await expect(ap.getByRole("heading", { name: `Заявка №${number}` })).toBeVisible();
  await expect(ap.getByText("Тестовая, 1")).toBeVisible();

  // статус и заметка
  await ap.selectOption("#status", "CONTACTED");
  await ap.getByRole("button", { name: "Сохранить статус" }).click();
  await ap.fill("textarea[name=text]", "e2e заметка");
  await ap.getByRole("button", { name: "Добавить" }).click();
  await expect(ap.getByText("e2e заметка")).toBeVisible();

  // фото: админу доступно, анониму — нет
  const src = await ap.locator("img").first().getAttribute("src");
  const anon = await browser.newContext({ baseURL });
  expect((await anon.request.get(src!)).status()).toBe(403);
  expect((await adminCtx.request.get(src!)).status()).toBe(200);
  await anon.close();
  await adminCtx.close();
});
