# Сайт по уборке снега (Москва и МО)

Корпоративный сайт + многошаговая форма заявки + админка. Цены не публикуются, калькулятора нет.
Источник требований: ТЗ заказчика (docs/SPEC.md). Название — Royal Snow (утверждено); логотип-знак и домен временные — меняются в админке.

## Стек
Next.js 16 (App Router, TS), PostgreSQL + Prisma 6, Tailwind 4, GSAP (только лёгкие reveal), zod, jose + bcryptjs.
Docker Compose: app + postgres + caddy (HTTPS) + notify-retry.

## Архитектура
- `app/(public)` — публичные страницы; `app/admin` — панель (`(panel)` под `requireAdmin`).
- `app/api/leads` — приём заявки (multipart: `data` JSON + `files`).
- `lib/serviceFields.ts` — ЕДИНЫЙ источник динамических полей формы (UI + валидация + админка).
- `lib/validation/lead.ts` — zod-схема и `sanitizeParams`.
- `lib/telegram.ts` — уведомления с backoff; заявка сохраняется ДО отправки, сбой Telegram её не теряет.
- `lib/uploads.ts` — файлы: диск `UPLOAD_DIR` (VPS) или таблица `StoredFile` (Vercel, `STORAGE=db`); magic bytes; отдача через `/api/files/*`
  (`leads/*` только админу).
- Контент (услуги, преимущества, этапы, настройки) — в БД, правится в админке.

## Правила
- Не добавлять цены, выдуманные гарантии, отзывы и фото — только то, что подтвердил заказчик.
- Любая server action в админке начинается с `requireAdmin()`.
- Новое поле формы — только через `lib/serviceFields.ts`.
- Секреты только в окружении, не в коде. PR создавать только по запросу.

## Команды
`npm run dev` · `npm run build` · `npm test` · `npm run test:e2e` · `npm run lint` · `npm run typecheck`
`npx prisma migrate dev` · `npm run db:seed` · `npm run admin:create` (ADMIN_EMAIL/ADMIN_PASSWORD; в Docker — автоматически)
Деплой: docs/DEPLOY.md (VPS), docs/VERCEL.md (превью); бэкап: scripts/backup.sh (docs/BACKUP.md).
