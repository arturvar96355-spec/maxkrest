import { cache } from "react";
import { db } from "@/lib/db";
import { dbReady } from "@/lib/dbStatus";
import type { SiteSettings } from "@prisma/client";

const DEMO_SETTINGS: SiteSettings = {
  id: 1, companyName: "Снегоуборка", logoText: "Снегоуборка", logoUrl: null, phone: "+7 (000) 000-00-00", email: null, address: null,
  telegramUrl: null, whatsappUrl: null, region: "Москва и Московская область", metrikaId: null, tgChatId: null,
  heroTitle: "Уборка снега в Москве и Московской области",
  heroText: "Уборка территорий, очистка крыш, парковок и проездов, механизированная уборка и вывоз снега для частных клиентов и организаций.",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!(await dbReady())) return DEMO_SETTINGS;
  return db.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
});

export const siteUrl = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
