import { cache } from "react";
import { db } from "@/lib/db";

export const getSettings = cache(async () => {
  return db.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
});

export const siteUrl = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
