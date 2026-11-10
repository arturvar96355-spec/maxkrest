import type { Metadata } from "next";
import { getSettings } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Политика обработки персональных данных", alternates: { canonical: "/politika-konfidencialnosti" } };

export default async function Policy() {
  const s = await getSettings();
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-navy">Политика обработки персональных данных</h1>
      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Шаблон. Текст подлежит согласованию с заказчиком и юристом на соответствие 152-ФЗ перед запуском сайта.</p>
      <div className="mt-6 space-y-4">
        <p>Оператор персональных данных: {s.companyName} (реквизиты будут указаны после регистрации юридического лица / ИП).</p>
        <h2 className="text-xl font-semibold">Какие данные мы собираем</h2>
        <p>Имя, номер телефона, адрес электронной почты, название организации, адрес объекта, сведения об объекте, комментарии и фотографии, переданные через форму заявки.</p>
        <h2 className="text-xl font-semibold">Цели обработки</h2>
        <p>Связь с вами, уточнение деталей заказа, подготовка индивидуального коммерческого предложения и выполнение работ.</p>
        <h2 className="text-xl font-semibold">Хранение и защита</h2>
        <p>Данные хранятся в базе данных на территории Российской Федерации, доступ ограничен уполномоченными сотрудниками. Данные не передаются третьим лицам, за исключением случаев, предусмотренных законом.</p>
        <h2 className="text-xl font-semibold">Ваши права</h2>
        <p>Вы можете запросить уточнение, блокирование или удаление ваших данных, а также отозвать согласие, обратившись по контактам на сайте.</p>
        <h2 className="text-xl font-semibold">Cookie и аналитика</h2>
        <p>Сайт использует Яндекс.Метрику для статистики посещений.</p>
      </div>
    </div>
  );
}
