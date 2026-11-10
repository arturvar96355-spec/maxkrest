# Сайт по уборке снега (Москва и МО)

Next.js + PostgreSQL + Prisma. Требования — `docs/SPEC.md`, правила проекта — `CLAUDE.md`.

## Быстрый старт
```bash
cp .env.example .env          # задайте DATABASE_URL, AUTH_SECRET, ADMIN_PASSWORD
npm ci
npx prisma migrate deploy
npm run db:seed && npm run admin:create
npm run dev
```
Админка: `/admin` (e-mail и пароль из `.env`).

## Проверки
```bash
npm run lint && npm run typecheck && npm test
npm run build && PORT=3100 npm start &   # затем:
npm run test:e2e                          # приёмочные сценарии, нужна БД и администратор
```

Развёртывание — `docs/DEPLOY.md`, бэкапы — `docs/BACKUP.md`, работа в админке — `docs/ADMIN_GUIDE.md`.
