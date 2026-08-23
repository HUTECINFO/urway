import { NextRequest, NextResponse } from "next/server";
import { getDealById, recordDealView } from "@/lib/data/deals";
import { RATE_LIMITS, getClientKey, isRateLimited, rateLimitResponse } from "@/lib/security/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

export async function POST(request: NextRequest, { params }: RouteContext) {
  const clientKey = getClientKey(request);
  if (isRateLimited("deal-view", clientKey, RATE_LIMITS.dealView)) {
    return rateLimitResponse(60);
  }

  const { id } = await params;
  if (!ID_PATTERN.test(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const deal = await getDealById(id);
  if (!deal) return NextResponse.json({ ok: false }, { status: 404 });

  const sessionId = request.cookies.get("urway_session")?.value ?? crypto.randomUUID();
  await recordDealView(id, sessionId);
  const response = NextResponse.json({ ok: true }, { status: 201 });
  if (!request.cookies.has("urway_session")) {
    response.cookies.set("urway_session", sessionId, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return response;
}
