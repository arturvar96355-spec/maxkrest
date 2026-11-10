"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { login, logout, requireAdmin } from "@/lib/auth";
import { saveImage } from "@/lib/uploads";
import { notifyLead } from "@/lib/telegram";
import { clientIp } from "@/lib/rateLimit";
import type { LeadStatus } from "@prisma/client";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => s(fd, k) || null;
const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

export async function loginAction(_: unknown, fd: FormData) {
  const ok = await login(s(fd, "email"), String(fd.get("password") ?? ""), clientIp(await headers()));
  if (!ok) return { error: "Неверные данные или слишком много попыток. Попробуйте позже." };
  redirect("/admin/zayavki");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export async function setStatus(fd: FormData) {
  await requireAdmin();
  await db.lead.update({ where: { id: s(fd, "id") }, data: { status: s(fd, "status") as LeadStatus } });
  revalidatePath("/admin/zayavki", "layout");
}

export async function addNote(fd: FormData) {
  const a = await requireAdmin();
  const text = s(fd, "text");
  if (text) await db.leadNote.create({ data: { leadId: s(fd, "id"), text, author: a.id } });
  revalidatePath(`/admin/zayavki/${s(fd, "id")}`);
}

export async function saveInternal(fd: FormData) {
  await requireAdmin();
  await db.lead.update({ where: { id: s(fd, "id") }, data: { agreedPrice: opt(fd, "agreedPrice"), outcome: opt(fd, "outcome") } });
  revalidatePath(`/admin/zayavki/${s(fd, "id")}`);
}

export async function resendNotify(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  await db.lead.update({ where: { id }, data: { notifyState: "PENDING" } });
  await notifyLead(id);
  revalidatePath(`/admin/zayavki/${id}`);
}

export async function deleteLead(fd: FormData) {
  await requireAdmin();
  if (s(fd, "confirm") !== "yes") return;
  await db.lead.delete({ where: { id: s(fd, "id") } });
  redirect("/admin/zayavki");
}

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  let logoUrl: string | undefined;
  const logo = fd.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const saved = await saveImage(Buffer.from(await logo.arrayBuffer()), "site");
    if (saved) logoUrl = `/api/files/${saved.storedAs}`;
  }
  const data = {
    companyName: s(fd, "companyName") || "Снегоуборка",
    logoText: s(fd, "logoText") || "Снегоуборка",
    phone: s(fd, "phone"),
    email: opt(fd, "email"),
    address: opt(fd, "address"),
    telegramUrl: opt(fd, "telegramUrl"),
    whatsappUrl: opt(fd, "whatsappUrl"),
    region: s(fd, "region"),
    metrikaId: opt(fd, "metrikaId"),
    tgChatId: opt(fd, "tgChatId"),
    heroTitle: s(fd, "heroTitle"),
    heroText: s(fd, "heroText"),
    ...(logoUrl ? { logoUrl } : {}),
    ...(fd.get("removeLogo") ? { logoUrl: null } : {}),
  };
  await db.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
}

export async function saveService(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  let image: string | undefined;
  const img = fd.get("image");
  if (img instanceof File && img.size > 0) {
    const saved = await saveImage(Buffer.from(await img.arrayBuffer()), "site");
    if (saved) image = saved.storedAs;
  }
  const data = {
    title: s(fd, "title"),
    short: s(fd, "short"),
    body: s(fd, "body"),
    works: lines(s(fd, "works")),
    visible: fd.get("visible") === "on",
    sort: Number(s(fd, "sort")) || 0,
    metaTitle: opt(fd, "metaTitle"),
    metaDesc: opt(fd, "metaDesc"),
    ...(image ? { image } : {}),
  };
  if (id) await db.service.update({ where: { id }, data });
  else {
    const slug = s(fd, "slug").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return;
    await db.service.create({ data: { ...data, slug, formKey: s(fd, "formKey") || "other" } });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/uslugi");
}

export async function deleteService(fd: FormData) {
  await requireAdmin();
  await db.service.delete({ where: { id: s(fd, "id") } });
  revalidatePath("/admin/uslugi");
}

type Block = "advantage" | "step" | "review";
export async function saveBlock(fd: FormData) {
  await requireAdmin();
  const kind = s(fd, "kind") as Block;
  const id = s(fd, "id");
  const sort = Number(s(fd, "sort")) || 0;
  const visible = fd.get("visible") === "on";
  if (kind === "advantage") {
    const data = { title: s(fd, "title"), text: s(fd, "text"), sort, visible };
    id ? await db.advantage.update({ where: { id }, data }) : await db.advantage.create({ data });
  } else if (kind === "step") {
    const data = { title: s(fd, "title"), text: s(fd, "text"), sort };
    id ? await db.step.update({ where: { id }, data }) : await db.step.create({ data });
  } else if (kind === "review") {
    const data = { author: s(fd, "title"), text: s(fd, "text"), sort, visible };
    id ? await db.review.update({ where: { id }, data }) : await db.review.create({ data });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/bloki");
}

export async function deleteBlock(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const kind = s(fd, "kind") as Block | "photo";
  if (kind === "advantage") await db.advantage.delete({ where: { id } });
  if (kind === "step") await db.step.delete({ where: { id } });
  if (kind === "review") await db.review.delete({ where: { id } });
  if (kind === "photo") await db.photo.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/bloki");
}

export async function uploadPhoto(fd: FormData) {
  await requireAdmin();
  for (const f of fd.getAll("photos")) {
    if (!(f instanceof File) || !f.size) continue;
    const saved = await saveImage(Buffer.from(await f.arrayBuffer()), "site");
    if (saved) await db.photo.create({ data: { storedAs: saved.storedAs, caption: opt(fd, "caption") } });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/bloki");
}
