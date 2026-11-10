import { getSettings } from "@/lib/site";
import { saveSettings } from "../../actions";

function I({ n, l, v, t = "text" }: { n: string; l: string; v?: string | null; t?: string }) {
  return (
    <div><label className="label" htmlFor={n}>{l}</label><input id={n} name={n} type={t} defaultValue={v ?? ""} className="field" /></div>
  );
}

export default async function Settings() {
  const s = await getSettings();
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Настройки сайта</h1>
      <form action={saveSettings} className="mt-6 grid max-w-3xl gap-4">
        <I n="companyName" l="Название компании" v={s.companyName} />
        <I n="logoText" l="Текстовый знак (рядом с логотипом)" v={s.logoText} />
        <div>
          <label className="label" htmlFor="logo">Логотип (изображение)</label>
          <input id="logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="field" />
          {s.logoUrl && <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="removeLogo" className="h-5 w-5" /> Удалить текущий логотип</label>}
        </div>
        <I n="phone" l="Телефон" v={s.phone} />
        <I n="email" l="E-mail" v={s.email} t="email" />
        <I n="address" l="Адрес" v={s.address} />
        <I n="telegramUrl" l="Ссылка на Telegram (https://t.me/…)" v={s.telegramUrl} />
        <I n="whatsappUrl" l="Ссылка на WhatsApp (https://wa.me/…)" v={s.whatsappUrl} />
        <I n="region" l="География работы" v={s.region} />
        <I n="heroTitle" l="Заголовок главной (H1)" v={s.heroTitle} />
        <div><label className="label" htmlFor="heroText">Подзаголовок главной</label><textarea id="heroText" name="heroText" rows={3} defaultValue={s.heroText} className="field" /></div>
        <I n="metrikaId" l="Номер счётчика Яндекс.Метрики" v={s.metrikaId} />
        <I n="tgChatId" l="Telegram chat id для уведомлений (если не задан в окружении)" v={s.tgChatId} />
        <button className="btn btn-primary w-fit">Сохранить</button>
      </form>
    </>
  );
}
