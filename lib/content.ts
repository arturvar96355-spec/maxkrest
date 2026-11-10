import { db } from "@/lib/db";
import defaults from "@/prisma/defaults.json";
import { isDemo } from "@/lib/dbStatus";

// Демо-режим (нет БД / нет миграций): типовое содержимое, заявки не принимаются. См. lib/dbStatus.ts.
export { isDemo };

export type ServiceView = {
  id: string; slug: string; title: string; short: string; body: string; works: string[];
  image: string | null; formKey: string; visible: boolean; sort: number; metaTitle: string | null; metaDesc: string | null;
};

const demoServices = (): ServiceView[] =>
  defaults.services.map((s, i) => ({ ...s, id: s.slug, image: null, visible: true, sort: i, metaTitle: null, metaDesc: null }));

export async function getServices(): Promise<ServiceView[]> {
  if (await isDemo()) return demoServices();
  return db.service.findMany({ where: { visible: true }, orderBy: { sort: "asc" } });
}

export async function getService(slug: string): Promise<ServiceView | null> {
  if (await isDemo()) return demoServices().find((s) => s.slug === slug) ?? null;
  const s = await db.service.findUnique({ where: { slug } });
  return s && s.visible ? s : null;
}

export async function getHomeBlocks() {
  if (await isDemo()) {
    return {
      advantages: defaults.advantages.map((a, i) => ({ id: String(i), ...a })),
      steps: defaults.steps.map((a, i) => ({ id: String(i), ...a })),
      photos: [] as { id: string; storedAs: string; caption: string | null }[],
      reviews: [] as { id: string; author: string; text: string }[],
    };
  }
  const [advantages, steps, photos, reviews] = await Promise.all([
    db.advantage.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
    db.step.findMany({ orderBy: { sort: "asc" } }),
    db.photo.findMany({ orderBy: { sort: "asc" }, take: 6 }),
    db.review.findMany({ where: { visible: true }, orderBy: { sort: "asc" }, take: 6 }),
  ]);
  return { advantages, steps, photos, reviews };
}
