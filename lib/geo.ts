/**
 * Заготовка под SEO-страницы «услуга + район» (ТЗ п. 9).
 * Пока список пуст — маршрут /uslugi/[услуга]/[район] отдаёт 404 и в sitemap ничего не попадает.
 * Чтобы включить район: добавьте запись и подготовьте для него уникальный текст, иначе будут дубли.
 */
export type District = { slug: string; name: string; /** «в Одинцово» */ where: string };

export const DISTRICTS: District[] = [];

export const getDistrict = (slug: string) => DISTRICTS.find((d) => d.slug === slug) ?? null;
