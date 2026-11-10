import { Header, Footer, MobileBar } from "@/components/SiteChrome";
import { getSettings } from "@/lib/site";
import { isDemo } from "@/lib/content";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">К содержимому</a>
      {(await isDemo()) && (
        <div role="note" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          Демо-режим: база данных не подключена или недоступна — показано типовое содержимое, заявки не сохраняются. См. docs/VERCEL.md.
        </div>
      )}
      <Header s={s} />
      <main id="main">{children}</main>
      <Footer s={s} />
      <MobileBar s={s} />
    </>
  );
}
