import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { verifyActiveDeals } from "@/lib/data/deals";

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const verified = await verifyActiveDeals();
  return NextResponse.json({ ok: true, verified });
}
