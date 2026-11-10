export function reachGoal(goal: "lead_submit" | "phone_click" | "messenger_click") {
  const w = window as unknown as { ym?: (...a: unknown[]) => void; __ymId?: string };
  const id = document.documentElement.dataset.ym;
  if (w.ym && id) w.ym(Number(id), "reachGoal", goal);
}
