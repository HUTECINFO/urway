import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { expireDueDeals } from "@/lib/data/deals";

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expired = await expireDueDeals();
  return NextResponse.json({ ok: true, expired });
}
