/** Звёзды рейтинга (только отображение). Доступное описание — в aria-label. */
export function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`Оценка ${value} из 5`} className="inline-flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} aria-hidden viewBox="0 0 24 24" className={className} fill={i <= Math.round(value) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      ))}
    </span>
  );
}
