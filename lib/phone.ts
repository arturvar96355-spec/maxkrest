/** Нормализует российский номер к виду +7XXXXXXXXXX, иначе null. */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  let n = d;
  if (n.length === 11 && (n[0] === "7" || n[0] === "8")) n = n.slice(1);
  else if (n.length !== 10) return null;
  if (n[0] !== "9" && n[0] !== "8" && n[0] !== "4" && n[0] !== "3") return null;
  return "+7" + n;
}

export function formatPhone(p: string): string {
  const m = p.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+7 (${m[1]}) ${m[2]}-${m[3]}-${m[4]}` : p;
}
