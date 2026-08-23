import { NextRequest, NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/posthog";
import { getDealById, recordDealClick } from "@/lib/data/deals";
import { getBookingFallback } from "@/lib/booking/flight-link";
import { SerpApiProvider, type ProviderBookingRequest } from "@/lib/providers/serp-api-provider";

interface RouteContext {
  params: Promise<{ dealId: string }>;
}

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function withSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set("urway_session", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}

function bookingPostResponse(booking: ProviderBookingRequest, sessionId: string): NextResponse | null {
  if (!booking.postData) return null;
  const fields = [...new URLSearchParams(booking.postData).entries()]
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
    .join("");
  if (!fields) return null;

  const providerName = escapeHtml(booking.bookWith ?? "el proveedor");
  const response = new NextResponse(`<!doctype html>
    <html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Abriendo tu tarifa | UR WAY</title></head>
    <body style="margin:0;display:grid;min-height:100vh;place-items:center;background:#0d1b2a;color:#fff;font-family:Arial,sans-serif"><main style="max-width:28rem;padding:2rem;text-align:center"><p style="margin:0 0 .75rem;color:#ff7a59;font-weight:700;letter-spacing:.13em;text-transform:uppercase;font-size:.7rem">UR WAY · enlace protegido</p><h1 style="margin:0;font-size:1.8rem">Abriendo tu tarifa con ${providerName}</h1><p style="color:#c5ccd5;line-height:1.55">Te llevamos a la opción exacta que encontramos. Si no abre automáticamente, continúa con el proveedor.</p><form id="urway-booking" method="post" action="${escapeHtml(booking.url)}">${fields}<button type="submit" style="border:0;border-radius:999px;background:#ff7a59;padding:.9rem 1.25rem;font-weight:700;color:#0d1b2a">Continuar a ${providerName}</button></form></main><script>document.getElementById('urway-booking').submit()</script></body></html>`, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
  return withSessionCookie(response, sessionId);
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { dealId } = await params;
  const url = new URL(request.url);
  const sessionId = request.cookies.get("urway_session")?.value ?? crypto.randomUUID();

  try {
    const deal = await getDealById(dealId);
    if (!deal) throw new Error("Drop no encontrado o no publicado");
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

    const booking = await new SerpApiProvider().getBookingRequestForDeal(deal);
    if (booking) {
      const postResponse = bookingPostResponse(booking, sessionId);
      if (postResponse) return postResponse;
      return withSessionCookie(NextResponse.redirect(booking.url, 307), sessionId);
    }

    return withSessionCookie(NextResponse.redirect(getBookingFallback(deal, destination), 307), sessionId);
  } catch {
    return NextResponse.redirect(new URL("/?error=drop-unavailable", request.url), 303);
  }
}
