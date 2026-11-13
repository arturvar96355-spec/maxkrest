import { Scene, type SceneKind } from "./Scene";
import { SnowField } from "./SnowField";

/**
 * Тёмный заголовочный блок страницы: сцена (или фото услуги) + падающий снег.
 * Фото, если есть, подставляется вместо сцены под затемнением.
 */
export function PageHero({ title, lead, kind = "other", image, eyebrow, children, compact = false, icon, id = "ph" }: {
  title: string; lead?: string; kind?: SceneKind | string; image?: string | null; eyebrow?: React.ReactNode; children?: React.ReactNode; compact?: boolean; icon?: React.ReactNode; id?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy to-navy-700 text-white">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/files/${image}`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/40 to-navy-900/90" />
        </>
      ) : (
        <Scene kind={kind} />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-900/75 via-navy-900/30 to-transparent" />
      <SnowField count={compact ? 26 : 38} id={`sf-${id}`} />
      <div className={`container-x relative ${compact ? "pb-16 pt-10 sm:pb-20" : "pb-36 pt-12 sm:pb-44 sm:pt-16"}`}>
        {eyebrow && <div className="fade-up mb-3 text-sm text-slate-300" style={{ ["--d" as string]: "0s" }}>{eyebrow}</div>}
        <div className="flex items-start gap-4">
          {icon && <span className="fade-up grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur" style={{ ["--d" as string]: "0.05s" }}>{icon}</span>}
          <h1 className="fade-up max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl" style={{ ["--d" as string]: "0.1s" }}>{title}</h1>
        </div>
        {lead && <p className="fade-up mt-5 max-w-2xl text-lg text-slate-200" style={{ ["--d" as string]: "0.25s" }}>{lead}</p>}
        {children && <div className="fade-up mt-7" style={{ ["--d" as string]: "0.4s" }}>{children}</div>}
      </div>
      <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] h-10 w-full text-white sm:h-14">
        <path fill="currentColor" d="M0 90V52c120 26 230 30 360 10 150-24 260-48 430-30 150 16 240 44 380 38 110-5 190-26 270-44v64Z" />
      </svg>
    </section>
  );
}
