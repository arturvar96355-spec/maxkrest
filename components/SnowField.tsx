/** Падающие снежинки: настоящие снежинки одного цвета, три слоя глубины (мелкие — медленнее и бледнее). */
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function SnowField({ count = 36, id = "sf" }: { count?: number; id?: string }) {
  const flakes = Array.from({ length: count }, (_, i) => {
    const depth = rnd(i, 1); // 0 — далеко, 1 — близко
    const size = 7 + depth * 15;
    return {
      left: `${rnd(i, 2) * 100}%`,
      size,
      opacity: 0.22 + depth * 0.6,
      dur: 24 - depth * 12 + rnd(i, 3) * 4,
      delay: -rnd(i, 4) * 26,
      sway: 10 + rnd(i, 5) * 34,
      sw: 3 + rnd(i, 6) * 3,
      spin: 14 + rnd(i, 7) * 18,
      y: `${rnd(i, 8) * 80}%`,
    };
  });
  return (
    <div aria-hidden className="snowfield">
      <svg width="0" height="0" className="absolute">
        <defs>
          <symbol id={id} viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <path key={a} transform={`rotate(${a} 12 12)`} d="M12 12V2.5M9.4 5 12 7.6 14.6 5" />
              ))}
            </g>
          </symbol>
        </defs>
      </svg>
      {flakes.map((f, i) => (
        <span key={i} className="flake" style={{ left: f.left, ["--s" as string]: `${f.size}px`, ["--o" as string]: f.opacity, ["--dur" as string]: `${f.dur}s`, ["--delay" as string]: `${f.delay}s`, ["--sway" as string]: `${f.sway}px`, ["--sw" as string]: `${f.sw}s`, ["--spin" as string]: `${f.spin}s`, ["--y" as string]: f.y }}>
          <i><svg viewBox="0 0 24 24"><use href={`#${id}`} /></svg></i>
        </span>
      ))}
    </div>
  );
}
