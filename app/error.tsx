"use client";
import Link from "next/link";

/** Дружелюбная страница на случай непредвиденной ошибки при отрисовке. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl font-bold text-navy">Что-то пошло не так</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">Страница временно недоступна. Попробуйте обновить её или вернитесь на главную.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => reset()} className="btn btn-primary">Обновить</button>
        <Link href="/" className="btn btn-secondary">На главную</Link>
      </div>
    </div>
  );
}
