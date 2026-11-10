import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 8 * 1024 * 1024;

/**
 * Где хранить файлы: "db" (Vercel — диск только для чтения) или "fs" (VPS/Docker, том uploads).
 * Задаётся STORAGE=db|fs; по умолчанию db на Vercel, иначе fs.
 */
export const storageMode = (): "db" | "fs" => (process.env.STORAGE === "db" || process.env.STORAGE === "fs" ? process.env.STORAGE : process.env.VERCEL ? "db" : "fs");

type Kind = { ext: string; mime: string };

/** Определяет тип по сигнатуре (magic bytes), а не по расширению/MIME клиента. */
export function sniffImage(buf: Buffer): Kind | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (buf.subarray(4, 8).toString() === "ftyp" && /heic|heix|mif1|hevc/.test(buf.subarray(8, 12).toString())) return { ext: "heic", mime: "image/heic" };
  return null;
}

export async function saveImage(buf: Buffer, sub: string): Promise<{ storedAs: string; mime: string; size: number } | null> {
  const kind = sniffImage(buf);
  if (!kind || buf.length > MAX_FILE_SIZE) return null;
  const storedAs = `${sub}/${randomUUID()}.${kind.ext}`;
  if (storageMode() === "db") {
    await db.storedFile.create({ data: { key: storedAs, data: new Uint8Array(buf), mime: kind.mime, size: buf.length } });
  } else {
    await mkdir(path.join(UPLOAD_DIR, sub), { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, storedAs), buf);
  }
  return { storedAs, mime: kind.mime, size: buf.length };
}

export async function readStored(storedAs: string): Promise<Buffer | null> {
  if (storageMode() === "db") {
    const f = await db.storedFile.findUnique({ where: { key: storedAs } });
    return f ? Buffer.from(f.data) : null;
  }
  const full = path.resolve(UPLOAD_DIR, storedAs);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) return null; // защита от path traversal
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}
