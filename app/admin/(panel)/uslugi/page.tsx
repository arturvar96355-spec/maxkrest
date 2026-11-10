import { db } from "@/lib/db";
import { saveService, deleteService } from "../../actions";
import { SERVICE_CHOICES } from "@/lib/serviceFields";

export default async function Services() {
  const list = await db.service.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Услуги</h1>
      <div className="mt-6 space-y-6">
        {list.map((s) => (
          <details key={s.id} className="rounded-xl border border-slate-200 p-5">
            <summary className="cursor-pointer font-semibold">{s.title} {!s.visible && <span className="text-sm font-normal text-slate-500">(скрыта)</span>}</summary>
            <ServiceForm s={s} />
            <form action={deleteService} className="mt-3"><input type="hidden" name="id" value={s.id} /><button className="text-sm text-red-700 underline">Удалить услугу</button></form>
          </details>
        ))}
        <details className="rounded-xl border border-dashed border-slate-300 p-5">
          <summary className="cursor-pointer font-semibold">+ Добавить услугу</summary>
          <ServiceForm />
        </details>
      </div>
    </>
  );
}

function ServiceForm({ s }: { s?: { id: string; title: string; short: string; body: string; works: string[]; visible: boolean; sort: number; metaTitle: string | null; metaDesc: string | null; image: string | null } }) {
  return (
    <form action={saveService} className="mt-4 grid max-w-3xl gap-3">
      {s ? <input type="hidden" name="id" value={s.id} /> : (
        <>
          <div><label className="label">Адрес страницы (латиницей, например uborka-dvorov)</label><input name="slug" required className="field" /></div>
          <div><label className="label">Ветка формы заявки</label><select name="formKey" className="field">{SERVICE_CHOICES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
        </>
      )}
      <div><label className="label">Название</label><input name="title" required defaultValue={s?.title} className="field" /></div>
      <div><label className="label">Краткое описание</label><input name="short" required defaultValue={s?.short} className="field" /></div>
      <div><label className="label">Описание</label><textarea name="body" required rows={4} defaultValue={s?.body} className="field" /></div>
      <div><label className="label">Перечень работ (по одному в строке)</label><textarea name="works" rows={5} defaultValue={s?.works.join("\n")} className="field" /></div>
      <div><label className="label">Фото (заменит текущее)</label><input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="field" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Title (SEO)</label><input name="metaTitle" defaultValue={s?.metaTitle ?? ""} className="field" /></div>
        <div><label className="label">Description (SEO)</label><input name="metaDesc" defaultValue={s?.metaDesc ?? ""} className="field" /></div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2"><input type="checkbox" name="visible" defaultChecked={s?.visible ?? true} className="h-5 w-5" /> Показывать на сайте</label>
        <label className="flex items-center gap-2">Порядок <input name="sort" type="number" defaultValue={s?.sort ?? 0} className="field !w-24" /></label>
      </div>
      <button className="btn btn-primary w-fit">Сохранить</button>
    </form>
  );
}
