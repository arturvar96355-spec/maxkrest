import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const services = await db.service.findMany({ where: { visible: true }, select: { slug: true } });
  return [
    ...["", "/uslugi", "/kontakty", "/zayavka", "/politika-konfidencialnosti"].map((p) => ({ url: base + p })),
    ...services.map((s) => ({ url: `${base}/uslugi/${s.slug}` })),
  ];
}
