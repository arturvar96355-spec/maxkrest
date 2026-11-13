/**
 * Тёмные векторные сцены-«фоны» (не фотографии): силуэты в сине-стальной гамме с тёплыми огоньками окон.
 * Для услуги с загруженным фото вместо сцены используется фото (см. PageHero).
 */
export type SceneKind = "private" | "commercial" | "roof" | "parking" | "mechanized" | "removal" | "complex" | "other";

const FAR = "#0f2c55";
const MID = "#0b2249";
const NEAR = "#071a38";
const RIM = "#2a5ea8";
const WIN = "#f2c46d";

function Towers({ items, fill, y = 470, win = true }: { items: [number, number, number][]; fill: string; y?: number; win?: boolean }) {
  return (
    <g>
      {items.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y - h} width={w} height={h} fill={fill} />
          <rect x={x} y={y - h} width={w} height="2" fill={RIM} opacity=".5" />
          {win && Array.from({ length: Math.floor((h - 24) / 26) }).flatMap((_, r) =>
            Array.from({ length: Math.max(1, Math.floor((w - 12) / 20)) }).map((__, c) => ((i * 7 + r * 3 + c * 5) % 4 === 0 ? <rect key={`${r}-${c}`} x={x + 8 + c * 20} y={y - h + 14 + r * 26} width="8" height="12" fill={WIN} opacity=".42" /> : null)),
          )}
        </g>
      ))}
    </g>
  );
}

function Fir({ x, h = 120, fill = NEAR }: { x: number; h?: number; fill?: string }) {
  const w = h * 0.5;
  return (
    <g transform={`translate(${x} 470)`}>
      {[0, 1, 2].map((k) => (
        <polygon key={k} points={`0,${-h * (0.36 + k * 0.3)} ${-w * (1 - k * 0.26)},${-h * k * 0.3} ${w * (1 - k * 0.26)},${-h * k * 0.3}`} fill={fill} />
      ))}
      <polygon points={`0,${-h} ${-w * 0.22},${-h * 0.8} ${w * 0.22},${-h * 0.8}`} fill="#cfe0f5" opacity=".5" />
    </g>
  );
}

function House({ x, w = 230, h = 120, roofH = 80 }: { x: number; w?: number; h?: number; roofH?: number }) {
  return (
    <g transform={`translate(${x} 470)`}>
      <rect x="0" y={-h} width={w} height={h} fill={NEAR} />
      <polygon points={`-18,${-h} ${w / 2},${-h - roofH} ${w + 18},${-h}`} fill={MID} stroke={RIM} strokeWidth="1.5" strokeOpacity=".6" />
      <polygon points={`-18,${-h} ${w / 2},${-h - roofH} ${w + 18},${-h} ${w + 10},${-h + 8} ${w / 2},${-h - roofH + 12} ${-10},${-h + 8}`} fill="#dbe8f7" opacity=".7" />
      <rect x={w * 0.68} y={-h - roofH * 0.7} width="16" height="40" fill={NEAR} />
      <rect x="28" y={-h + 26} width="30" height="34" fill={WIN} opacity=".5" />
      <rect x={w - 70} y={-h + 26} width="30" height="34" fill={WIN} opacity=".4" />
      <rect x={w / 2 - 14} y={-h + 50} width="28" height={h - 50} fill="#05142b" />
    </g>
  );
}

function Car({ x, c = "#0a2a55" }: { x: number; c?: string }) {
  return (
    <g transform={`translate(${x} 470)`}>
      <path d="M0 -26 Q0 -40 14 -42 L40 -46 L58 -68 Q64 -74 74 -74 L118 -74 Q128 -74 134 -66 L150 -46 L168 -42 Q180 -40 180 -26 V-12 H0Z" fill={c} stroke={RIM} strokeOpacity=".55" />
      <path d="M62 -46 L74 -66 H116 L128 -46Z" fill="#05142b" opacity=".85" />
      <path d="M-2 -70 Q70 -92 182 -70 Q150 -80 90 -80 Q40 -80 -2 -70Z" fill="#dbe8f7" opacity=".55" />
      <circle cx="40" cy="-10" r="15" fill="#05142b" stroke={RIM} strokeOpacity=".5" />
      <circle cx="140" cy="-10" r="15" fill="#05142b" stroke={RIM} strokeOpacity=".5" />
      <rect x="168" y="-34" width="10" height="7" fill={WIN} opacity=".7" />
    </g>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 470)`}>
      <rect x="-3" y="-190" width="6" height="190" fill={NEAR} />
      <rect x="-3" y="-192" width="40" height="5" fill={NEAR} />
      <ellipse cx="30" cy="-182" rx="90" ry="12" fill={WIN} opacity=".06" />
      <polygon points="14,-186 46,-186 100,0 -40,0" fill={WIN} opacity=".05" />
      <circle cx="32" cy="-186" r="5" fill={WIN} opacity=".9" />
    </g>
  );
}

function Tractor() {
  return (
    <g className="drive" style={{ ["--drive-dur" as string]: "36s", animationDelay: "-13s" }}>
      <g transform="translate(0 474)">
        {/* отвал */}
        <polygon points="262,-6 286,-70 304,-70 300,-4" fill="#143868" stroke={RIM} strokeOpacity=".7" />
        <path d="M236 -52 L286 -44" stroke={RIM} strokeWidth="5" opacity=".8" />
        {/* корпус */}
        <rect x="66" y="-74" width="176" height="36" rx="5" fill={MID} stroke={RIM} strokeOpacity=".6" />
        <rect x="170" y="-88" width="80" height="48" rx="6" fill={MID} stroke={RIM} strokeOpacity=".6" />
        {/* кабина */}
        <polygon points="74,-74 88,-142 160,-142 168,-74" fill={NEAR} stroke={RIM} strokeOpacity=".6" />
        <polygon points="94,-130 100,-86 156,-86 152,-130" fill={WIN} opacity=".38" />
        <rect x="80" y="-150" width="86" height="8" fill={MID} />
        <circle cx="123" cy="-160" r="5" fill="#ffb347" opacity=".9" />
        {/* колёса */}
        <circle cx="108" cy="-34" r="38" fill="#04112a" stroke={RIM} strokeOpacity=".6" strokeWidth="2" />
        <circle cx="108" cy="-34" r="14" fill={MID} />
        <circle cx="228" cy="-22" r="24" fill="#04112a" stroke={RIM} strokeOpacity=".6" strokeWidth="2" />
        <circle cx="228" cy="-22" r="9" fill={MID} />
        {/* фара и снежная пыль */}
        <polygon points="250,-62 520,-30 250,-30" fill={WIN} opacity=".05" />
        {[0, 0.6, 1.2].map((d, i) => (
          <circle key={i} className="puff" cx={296 + i * 8} cy={-14 - i * 6} r="14" fill="#dbe8f7" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
    </g>
  );
}

function Truck() {
  return (
    <g className="drive" style={{ ["--drive-dur" as string]: "40s", animationDelay: "-15s" }}>
      <g transform="translate(0 474)">
        <polygon points="196,-40 226,-40 244,-82 210,-100 196,-100" fill={MID} stroke={RIM} strokeOpacity=".6" />
        <polygon points="204,-92 222,-80 232,-60 204,-60" fill={WIN} opacity=".4" />
        <polygon points="0,-48 0,-110 180,-120 188,-48" fill={NEAR} stroke={RIM} strokeOpacity=".6" />
        <path d="M6 -108 Q70 -150 120 -138 Q160 -132 184 -118 L180 -122 L0 -110Z" fill="#dbe8f7" opacity=".75" />
        <rect x="0" y="-48" width="244" height="14" fill={MID} />
        {[44, 118, 206].map((cx) => (
          <g key={cx}><circle cx={cx} cy="-26" r="26" fill="#04112a" stroke={RIM} strokeOpacity=".6" strokeWidth="2" /><circle cx={cx} cy="-26" r="9" fill={MID} /></g>
        ))}
        {[0, 0.8].map((d, i) => <circle key={i} className="puff" cx={-6 - i * 8} cy={-60 - i * 8} r="12" fill="#dbe8f7" style={{ animationDelay: `${d}s` }} />)}
      </g>
    </g>
  );
}

function Roof() {
  const ic = Array.from({ length: 30 }, (_, i) => 26 + i * 48 + ((i * 13) % 17));
  return (
    <g>
      {/* здание с плоской кровлей */}
      <rect x="0" y="352" width="1440" height="118" fill={MID} />
      <rect x="0" y="352" width="1440" height="2" fill={RIM} opacity=".5" />
      {Array.from({ length: 28 }).map((_, c) => (c % 3 === 1 ? <rect key={c} x={28 + c * 51} y="392" width="26" height="36" fill={WIN} opacity=".5" /> : null))}
      {/* снежная шапка и карниз */}
      <path d="M-10 352V322Q60 296 140 314T300 308T460 316T620 300T780 314T940 304T1100 316T1260 302T1450 318V352Z" fill="#dbe8f7" opacity=".82" />
      <path d="M-10 330Q60 304 140 320T300 316T460 322T620 308T780 320T940 312T1100 322T1260 310T1450 326V318Q1260 294 1100 308T780 304T460 308T140 306T-10 316Z" fill="#f2f7fd" opacity=".6" />
      {/* сосульки */}
      {ic.map((x, i) => {
        const h = 22 + ((i * 7) % 5) * 11;
        return <polygon key={x} className={i % 4 === 0 ? "drip" : undefined} style={{ animationDelay: `${(i % 5) * 0.6}s` }} points={`${x - 7},350 ${x + 7},350 ${x},${350 + h}`} fill="#cfe0f5" opacity=".75" />;
      })}
      {/* оборудование на кровле */}
      <rect x="980" y="262" width="62" height="42" fill={NEAR} />
      <rect x="974" y="256" width="74" height="9" fill="#dbe8f7" opacity=".75" />
      <rect x="300" y="276" width="6" height="40" fill={NEAR} /><rect x="286" y="288" width="34" height="3" fill={NEAR} /><rect x="290" y="298" width="26" height="3" fill={NEAR} />
    </g>
  );
}

export function Scene({ kind = "other", className = "" }: { kind?: SceneKind | string; className?: string }) {
  const k = (["private", "commercial", "roof", "parking", "mechanized", "removal", "complex", "other"].includes(kind) ? kind : "other") as SceneKind;
  return (
    <svg aria-hidden viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" className={`absolute inset-0 h-full w-full ${className}`}>
      <defs>
        <linearGradient id="gGround" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a8c3e6" stopOpacity=".38" /><stop offset="1" stopColor="#5f86bc" stopOpacity=".22" /></linearGradient>
      </defs>
      {k !== "roof" && <Towers items={[[40, 90, 150], [150, 70, 210], [240, 110, 120], [380, 80, 170], [900, 90, 190], [1010, 120, 140], [1160, 70, 230], [1250, 100, 160], [1370, 80, 120]]} fill={FAR} y={470} win={false} />}
      {(k === "commercial" || k === "complex" || k === "other") && <Towers items={[[120, 140, 250], [300, 100, 190], [450, 120, 300], [980, 130, 260], [1140, 110, 200], [1280, 150, 280]]} fill={MID} />}
      {k === "private" && (<><Fir x={120} h={150} /><Fir x={190} h={110} /><House x={330} /><House x={720} w={260} h={130} roofH={90} /><Fir x={1100} h={160} /><Fir x={1180} h={120} /><Fir x={1260} h={150} /></>)}
      {k === "roof" && <><Towers items={[[40, 110, 180], [180, 90, 140], [1180, 100, 200], [1300, 110, 150]]} fill={FAR} win={false} /><Roof /></>}
      {k === "parking" && (<><Lamp x={260} /><Lamp x={900} /><Car x={420} /><Car x={650} c="#0c2f5f" /><Car x={1060} /><g transform="translate(1330 470)"><rect x="-2" y="-170" width="5" height="170" fill={NEAR} /><rect x="-30" y="-215" width="60" height="50" rx="6" fill="#143868" stroke={RIM} /><text x="0" y="-178" textAnchor="middle" fontSize="38" fontWeight="700" fill="#dbe8f7" fontFamily="system-ui,sans-serif">P</text></g></>)}
      {k === "mechanized" && (<><Fir x={100} h={130} fill={MID} /><Fir x={1330} h={140} fill={MID} /><Tractor /></>)}
      {k === "removal" && (<><Towers items={[[60, 200, 110], [1100, 240, 120]]} fill={NEAR} /><Truck /></>)}
      {k === "complex" && (<><Fir x={90} h={130} /><Fir x={1340} h={130} /></>)}
      {/* заснеженная земля */}
      <path d="M0 468 C200 446 380 484 660 460 S1180 442 1440 466 V520 H0Z" fill="url(#gGround)" />
      <path d="M0 482 C260 466 520 494 780 476 S1250 462 1440 480 V520 H0Z" fill="#dbe8f7" opacity=".14" />
    </svg>
  );
}
