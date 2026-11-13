"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Фоновое видео, которое не ломается там, где автозапуск запрещён (iOS в режиме энергосбережения,
 * экономия трафика, reduce-motion): тогда остаётся статичный постер и никаких кнопок «play».
 * Видео показывается только после того, как реально началось воспроизведение.
 */
export function HeroVideo({ poster, webm, mp4, className = "" }: { poster: string; webm: string; mp4: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData) return;

    const onPlaying = () => setPlaying(true);
    const onStopped = () => setPlaying(false); // система поставила на паузу (например, включили энергосбережение)
    const tryPlay = () => { v.play().catch(() => {}); };
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onStopped);

    tryPlay();
    // Если автозапуск запрещён — пробуем ещё раз при первом касании (жест пользователя это разрешает)
    const gesture = () => tryPlay();
    const events = ["touchend", "pointerup", "click", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, gesture, { passive: true }));
    const onVisible = () => { if (document.visibilityState === "visible") tryPlay(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onStopped);
      events.forEach((e) => window.removeEventListener(e, gesture));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`hero-video transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"} ${className}`}
      autoPlay muted loop playsInline preload="auto" poster={poster}
      disablePictureInPicture disableRemotePlayback
      data-playing={playing ? "1" : "0"}
      aria-hidden tabIndex={-1}
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
