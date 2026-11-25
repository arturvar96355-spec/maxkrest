import { describe, it, expect } from "vitest";
import { reviewSchema } from "@/lib/validation/review";
import { statsOf } from "@/lib/reviews";

const ok = { author: "Анна", rating: 5, text: "Очистили крышу быстро и аккуратно, всё объяснили.", consent: true as const, startedAt: 1 };

describe("валидация отзыва", () => {
  it("принимает корректный отзыв", () => expect(reviewSchema.safeParse(ok).success).toBe(true));
  it("требует оценку 1–5, имя, текст от 20 символов и согласие", () => {
    expect(reviewSchema.safeParse({ ...ok, rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...ok, rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...ok, author: "А" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...ok, text: "Хорошо" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
  });
  it("отклоняет заполненную ловушку и неизвестную услугу, ограничивает длину", () => {
    expect(reviewSchema.safeParse({ ...ok, website: "spam" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...ok, serviceKey: "hack" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...ok, serviceKey: "roof" }).success).toBe(true);
    expect(reviewSchema.safeParse({ ...ok, text: "а".repeat(1501) }).success).toBe(false);
  });
});

describe("статистика отзывов", () => {
  it("считает среднюю оценку и распределение только по реальным оценкам", () => {
    const s = statsOf([{ rating: 5 }, { rating: 4 }, { rating: null }]);
    expect(s.count).toBe(3);
    expect(s.average).toBeCloseTo(4.5);
    expect(s.dist[5]).toBe(1);
    expect(statsOf([]).average).toBe(0);
  });
});
