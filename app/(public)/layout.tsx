import { Header, Footer } from "@/components/SiteChrome";
import { getSettings } from "@/lib/site";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">К содержимому</a>
      <Header s={s} />
      <main id="main">{children}</main>
      <Footer s={s} />
    </>
  );
}
