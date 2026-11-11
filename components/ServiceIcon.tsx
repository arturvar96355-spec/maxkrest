/** Простые линейные иконки услуг (без внешних зависимостей и без «фотографий»). */
const paths: Record<string, React.ReactNode> = {
  private: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-5.5h4V20" /></>,
  commercial: <><path d="M5 21V4h9v17" /><path d="M14 9h5v12" /><path d="M8 8h3M8 12h3M8 16h3M3 21h18" /></>,
  roof: <><path d="M2.5 12 12 4l9.5 8" /><path d="M6 12v2.5M10 12v5M14 12v3.5M18 12v2" /></>,
  parking: <><rect x="4" y="3.5" width="16" height="17" rx="3" /><path d="M10 16.5v-9h3a2.8 2.8 0 0 1 0 5.6h-3" /></>,
  mechanized: <><path d="M3 15.5V9h8l2 3h6.5l1.5 3.5" /><path d="M3 15.5h18" /><circle cx="7.5" cy="17.5" r="2" /><circle cx="17" cy="17.5" r="2" /></>,
  removal: <><path d="M2.5 16V8h10v8" /><path d="M12.5 11h4l3 3v2h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>,
  complex: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></>,
  other: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5M12 16h.01" /></>,
};

export function ServiceIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] ?? paths.other}
    </svg>
  );
}
