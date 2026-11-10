import { db } from "@/lib/db";
import { saveBlock, deleteBlock, uploadPhoto } from "../../actions";

type Item = { id?: string; title: string; text: string; sort: number; visible?: boolean };

function BlockForm({ kind, item, showVisible }: { kind: string; item?: Item; showVisible?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <form action={saveBlock} className="grid gap-2">
        <input type="hidden" name="kind" value={kind} />
        {item?.id && <input type="hidden" name="id" value={item.id} />}
        <input name="title" required placeholder={kind === "review" ? "Автор" : "Заголовок"} defaultValue={item?.title} className="field" />
        <textarea name="text" required rows={2} placeholder="Текст" defaultValue={item?.text} className="field" />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">Порядок <input name="sort" type="number" defaultValue={item?.sort ?? 0} className="field !w-24" /></label>
          {showVisible && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visible" defaultChecked={item?.visible ?? false} className="h-5 w-5" /> Показывать</label>}
          <button className="btn btn-secondary !min-h-10 !py-1">{item ? "Сохранить" : "Добавить"}</button>
        </div>
      </form>
      {item?.id && <form action={deleteBlock} className="mt-2"><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={item.id} /><button className="text-sm text-red-700 underline">Удалить</button></form>}
    </div>
  );
}

export default async function Blocks() {
  const [adv, steps, reviews, photos] = await Promise.all([
    db.advantage.findMany({ orderBy: { sort: "asc" } }),
    db.step.findMany({ orderBy: { sort: "asc" } }),
    db.review.findMany({ orderBy: { sort: "asc" } }),
    db.photo.findMany({ orderBy: { sort: "asc" } }),
  ]);
  return (
    <div className="max-w-3xl space-y-12">
      <section><h2 className="mb-4 text-xl font-bold text-navy">Преимущества</h2><div className="space-y-3">{adv.map((a) => <BlockForm key={a.id} kind="advantage" showVisible item={a} />)}<BlockForm kind="advantage" showVisible /></div></section>
      <section><h2 className="mb-4 text-xl font-bold text-navy">Как мы работаем (этапы)</h2><div className="space-y-3">{steps.map((a) => <BlockForm key={a.id} kind="step" item={a} />)}<BlockForm kind="step" /></div></section>
      <section>
        <h2 className="mb-1 text-xl font-bold text-navy">Отзывы</h2>
        <p className="mb-4 text-sm text-slate-500">Публикуйте только подтверждённые отзывы. Отмеченные «Показывать» отзывы выводятся на главной.</p>
        <div className="space-y-3">{reviews.map((a) => <BlockForm key={a.id} kind="review" showVisible item={{ ...a, title: a.author }} />)}<BlockForm kind="review" showVisible /></div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold text-navy">Фотографии выполненных работ</h2>
        <form action={uploadPhoto} className="grid gap-2 rounded-lg border border-slate-200 p-4">
          <input name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" className="field" />
          <input name="caption" placeholder="Подпись (необязательно)" className="field" />
          <button className="btn btn-secondary w-fit">Загрузить</button>
        </form>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <figure key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/files/${p.storedAs}`} alt={p.caption ?? ""} className="aspect-[4/3] w-full rounded-lg object-cover" />
              <form action={deleteBlock}><input type="hidden" name="kind" value="photo" /><input type="hidden" name="id" value={p.id} /><button className="text-sm text-red-700 underline">Удалить</button></form>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
