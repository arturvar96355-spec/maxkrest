import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const COOKIE = "admin_session";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s === "change-me") {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET не задан");
    return new TextEncoder().encode("dev-secret-dev-secret-dev-secret");
  }
  return new TextEncoder().encode(s);
};

export async function login(email: string, password: string, ip: string): Promise<boolean> {
  const key = `${ip}|${email.toLowerCase()}`;
  const recent = await db.loginAttempt.count({ where: { key, createdAt: { gte: new Date(Date.now() - 15 * 60_000) } } });
  if (recent >= 5) return false;
  const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : (await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi"), false);
  if (!ok || !user) {
    await db.loginAttempt.create({ data: { key } });
    return false;
  }
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setExpirationTime("7d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax", // защита от CSRF для POST из чужих сайтов; server actions дополнительно проверяют Origin
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 86400,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin(): Promise<{ id: string; role: string } | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    return { id: String(payload.sub), role: String(payload.role ?? "admin") };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}
