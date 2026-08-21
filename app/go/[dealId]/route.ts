import { NextRequest, NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/posthog";
import { recordDealClick } from "@/lib/data/deals";

interface RouteContext {
  params: Promise<{ dealId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { dealId } = await params;
  const url = new URL(request.url);
  const sessionId = request.cookies.get("urway_session")?.value ?? crypto.randomUUID();

  try {
    const destination = await recordDealClick({
      dealId,
      sessionId,
      source: url.searchParams.get("source"),
      referrer: request.headers.get("referer"),
      utmSource: url.searchParams.get("utm_source"),
      utmMedium: url.searchParams.get("utm_medium"),
      utmCampaign: url.searchParams.get("utm_campaign"),
    });
    captureServerEvent("deal_click_out", {
      distinct_id: sessionId,
      deal_id: dealId,
      source: url.searchParams.get("source"),
    });
    const response = NextResponse.redirect(destination, 307);
    response.cookies.set("urway_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?error=drop-unavailable", request.url), 303);
  }
}
