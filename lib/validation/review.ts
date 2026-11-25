import { z } from "zod";
import { SERVICE_CHOICES, type FormKey } from "@/lib/serviceFields";

const keys = SERVICE_CHOICES.map((s) => s.key) as [FormKey, ...FormKey[]];

export const reviewSchema = z.object({
  author: z.string().trim().min(2, "Укажите имя").max(60, "Слишком длинное имя"),
  rating: z.number().int().min(1, "Поставьте оценку").max(5),
  text: z.string().trim().min(20, "Напишите хотя бы пару предложений (от 20 символов)").max(1500, "Не больше 1500 символов"),
  serviceKey: z.enum(keys).optional().or(z.literal("")),
  contact: z.string().trim().max(120).optional(),
  consent: z.literal(true, { message: "Необходимо согласие на обработку данных и публикацию отзыва" }),
  website: z.string().max(0).optional(), // honeypot
  startedAt: z.number().int(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
