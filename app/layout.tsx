import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getSettings, siteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.heroTitle} — ${s.companyName}`, template: `%s — ${s.companyName}` },
    description: s.heroText,
    openGraph: { type: "website", locale: "ru_RU", siteName: s.companyName },
  };
}

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b2545" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const id = s.metrikaId?.replace(/\D/g, "");
  return (
    <html lang="ru" data-ym={id || undefined}>
      <body>
        {children}
        {id && (
          <Script id="ym" strategy="afterInteractive">{`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`}</Script>
        )}
      </body>
    </html>
  );
}
