import { NextResponse } from "next/server";
import { retryPending } from "@/lib/telegram";

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ sent: await retryPending() });
}

// Vercel Cron вызывает GET с заголовком Authorization: Bearer $CRON_SECRET; контейнер notify-retry — POST.
export const GET = handle;
export const POST = handle;
