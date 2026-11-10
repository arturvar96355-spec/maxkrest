import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata = { title: "Панель управления", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <header className="bg-navy text-white">
        <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm">
          <b>Админка</b>
          <Link href="/admin/zayavki">Заявки</Link>
          <Link href="/admin/uslugi">Услуги</Link>
          <Link href="/admin/bloki">Блоки и фото</Link>
          <Link href="/admin/nastroiki">Настройки сайта</Link>
          <Link href="/" className="ml-auto">На сайт</Link>
          <form action={logoutAction}><button className="underline">Выйти</button></form>
        </div>
      </header>
      <div className="container-x py-8">{children}</div>
    </div>
  );
}
