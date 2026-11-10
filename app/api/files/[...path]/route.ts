import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { readStored } from "@/lib/uploads";

export const runtime = "nodejs";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic" };

/** Публичные фото сайта (site/*) — всем; фото заявок (leads/*) — только администратору. */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const rel = parts.join("/");
  if (parts[0] === "leads") {
    if (!(await getAdmin())) return new NextResponse("Forbidden", { status: 403 });
  } else if (parts[0] !== "site") {
    return new NextResponse("Not found", { status: 404 });
  }
  const buf = await readStored(rel);
  if (!buf) return new NextResponse("Not found", { status: 404 });
  const ext = rel.split(".").pop() ?? "";
  const headers: Record<string, string> = {
    "content-type": MIME[ext] ?? "application/octet-stream",
    "cache-control": parts[0] === "site" ? "public, max-age=86400" : "private, no-store",
    "x-content-type-options": "nosniff",
  };
  if (new URL(req.url).searchParams.has("download")) {
    const f = await db.leadFile.findFirst({ where: { storedAs: rel } });
    headers["content-disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(f?.origName ?? rel.split("/").pop()!)}`;
  }
  return new NextResponse(new Uint8Array(buf), { headers });
}
