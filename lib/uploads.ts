import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 8 * 1024 * 1024;

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
  const dir = path.join(UPLOAD_DIR, sub);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${kind.ext}`;
  await writeFile(path.join(dir, name), buf);
  return { storedAs: `${sub}/${name}`, mime: kind.mime, size: buf.length };
}

export async function readStored(storedAs: string): Promise<Buffer | null> {
  const full = path.resolve(UPLOAD_DIR, storedAs);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) return null; // защита от path traversal
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}
