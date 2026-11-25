import { db } from "@/lib/db";
import { isDemo } from "@/lib/dbStatus";

export type PublicReview = {
  id: string;
  author: string;
  text: string;
  rating: number | null;
  serviceKey: string | null;
  reply: string | null;
  date: Date;
  /** true — примерный текст для оценки дизайна в демо-режиме (не реальный отзыв) */
  mock?: boolean;
};

/** Макет оформления для демо-режима (без БД): помечается на странице, в боевом режиме не используется. */
const MOCKS: PublicReview[] = [
  { id: "m1", author: "Имя Ф.", rating: 5, serviceKey: "roof", date: new Date("2026-01-15"), mock: true, reply: null, text: "Пример оформления отзыва. Здесь будет текст отзыва клиента о выполненной работе: что делали, как договорились, остался ли доволен." },
  { id: "m2", author: "Имя Ф.", rating: 5, serviceKey: "parking", date: new Date("2026-01-09"), mock: true, reply: "Пример ответа компании на отзыв.", text: "Пример оформления отзыва. Текст может быть короче или длиннее, карточка подстраивается под содержимое." },
  { id: "m3", author: "Имя Ф.", rating: 4, serviceKey: null, date: new Date("2025-12-28"), mock: true, reply: null, text: "Пример оформления отзыва с четырьмя звёздами. Реальные отзывы появляются только после проверки менеджером." },
];

export type ReviewStats = { count: number; average: number; dist: Record<1 | 2 | 3 | 4 | 5, number> };

export function statsOf(list: { rating: number | null }[]): ReviewStats {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewStats["dist"];
  let sum = 0, n = 0;
  for (const r of list) if (r.rating) { dist[r.rating as 1 | 2 | 3 | 4 | 5]++; sum += r.rating; n++; }
  return { count: list.length, average: n ? sum / n : 0, dist };
}

/** Опубликованные отзывы (после модерации), свежие сверху. */
export async function getPublishedReviews(limit?: number): Promise<{ reviews: PublicReview[]; demo: boolean }> {
  if (await isDemo()) return { reviews: limit ? MOCKS.slice(0, limit) : MOCKS, demo: true };
  const rows = await db.review.findMany({ where: { status: "APPROVED" }, orderBy: [{ sort: "asc" }, { publishedAt: "desc" }], take: limit });
  return {
    demo: false,
    reviews: rows.map((r) => ({ id: r.id, author: r.author, text: r.text, rating: r.rating, serviceKey: r.serviceKey, reply: r.reply, date: r.publishedAt ?? r.createdAt })),
  };
}

export const formatReviewDate = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Moscow" });
