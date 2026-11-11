import { notFound, redirect } from "next/navigation";
import { getDistrict } from "@/lib/geo";

/**
 * Заготовка SEO-страницы «услуга + район». Пока районов в lib/geo.ts нет — 404.
 * Когда районы появятся, здесь нужно вывести уникальный контент для района.
 */
export default async function DistrictServicePage({ params }: { params: Promise<{ slug: string; district: string }> }) {
  const { slug, district } = await params;
  if (!getDistrict(district)) notFound();
  redirect(`/uslugi/${slug}`);
}
