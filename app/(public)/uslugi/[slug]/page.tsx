import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getService } from "@/lib/content";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return { title: s.metaTitle || s.title, description: s.metaDesc || s.short, alternates: { canonical: `/uslugi/${s.slug}` } };
}

export default async function ServicePage({ params }: P) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) notFound();
  return (
    <div className="container-x py-12">
      <nav aria-label="Хлебные крошки" className="text-sm text-slate-500"><Link href="/uslugi">Услуги</Link> / {s.title}</nav>
      <h1 className="mt-3 text-3xl font-bold text-navy">{s.title}</h1>
      <p className="mt-4 max-w-3xl text-lg">{s.body}</p>
      {s.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/files/${s.image}`} alt={s.title} className="mt-6 max-h-96 w-full max-w-3xl rounded-xl object-cover" />
      )}
      <h2 className="mt-10 text-xl font-semibold text-navy">Что входит в работы</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6">{s.works.map((w) => <li key={w}>{w}</li>)}</ul>
      <Link href={`/zayavka?service=${s.formKey}`} className="btn btn-primary mt-10">Оставить заявку</Link>
    </div>
  );
}
