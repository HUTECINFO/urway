import { NextRequest, NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/posthog";
import { getDealById, recordDealClick } from "@/lib/data/deals";
import { TravelpayoutsProvider } from "@/lib/providers/travelpayouts-provider";

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
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}

function resolvingResponse(dealId: string, slug: string, sessionId: string): NextResponse {
  const resolveUrl = JSON.stringify(`/go/${encodeURIComponent(dealId)}?resolve=1`);
  const backUrl = `/drop/${escapeHtml(slug)}`;
  const response = new NextResponse(`<!doctype html>
    <html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Buscando tu tarifa | UR WAY</title><style>@keyframes fly{0%{transform:translateX(-38px) rotate(-8deg)}50%{transform:translateX(38px) rotate(8deg)}100%{transform:translateX(-38px) rotate(-8deg)}}@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}*{box-sizing:border-box}body{margin:0;display:grid;min-height:100vh;place-items:center;background:radial-gradient(circle at 50% 15%,#1d344a 0,#0d1b2a 52%,#08121d 100%);color:#fff;font-family:Arial,sans-serif}.card{width:min(92vw,34rem);padding:clamp(1.5rem,7vw,3rem);text-align:center;border:1px solid rgba(255,255,255,.12);border-radius:2rem;background:rgba(13,27,42,.72);box-shadow:0 28px 80px rgba(0,0,0,.28);backdrop-filter:blur(18px)}.plane{display:inline-grid;width:5rem;height:5rem;place-items:center;margin-bottom:1.25rem;border-radius:1.5rem;background:#ff7a59;color:#0d1b2a;font-size:2rem;animation:fly 2.2s cubic-bezier(.45,0,.55,1) infinite}.eyebrow{margin:0 0 .75rem;color:#ff9a80;font-size:.7rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase}h1{margin:0;font-size:clamp(2rem,9vw,3.4rem);line-height:1}.status{min-height:3.2rem;color:#c5ccd5;line-height:1.6;animation:pulse 1.8s ease-in-out infinite}.track{height:.35rem;margin:1.5rem 0;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.1)}.track:after{display:block;width:45%;height:100%;border-radius:inherit;background:#ff7a59;content:"";animation:fly 1.6s ease-in-out infinite}.back{display:none;color:#fff;text-underline-offset:4px}</style></head>
    <body><main class="card"><div class="plane" aria-hidden="true">✈</div><p class="eyebrow">UR WAY · enlace afiliado</p><h1 id="title">Preparando tu comparación</h1><p class="status" id="status">Abriremos la ruta y las fechas seleccionadas para que elijas la agencia que más te convenga.</p><div class="track" id="track"></div><a class="back" id="back" href="${backUrl}">Volver al Drop</a></main><script>(()=>{const status=document.getElementById('status'),title=document.getElementById('title'),track=document.getElementById('track'),back=document.getElementById('back');const messages=['Actualizando la tarifa publicada…','Preparando las agencias disponibles…','Abriendo la comparación en Aviasales…'];let index=0;const ticker=setInterval(()=>{status.textContent=messages[Math.min(index++,messages.length-1)]},3500);const fail=()=>{clearInterval(ticker);title.textContent='No pudimos abrir esta ruta';status.textContent='La comparación no está disponible en este momento. Inténtalo de nuevo desde el Drop.';status.style.animation='none';track.style.display='none';back.style.display='inline'};fetch(${resolveUrl},{headers:{accept:'application/json'},credentials:'same-origin'}).then(async response=>{const payload=await response.json();if(!response.ok||!payload.url)throw new Error('unavailable');clearInterval(ticker);const amount=Number.isFinite(payload.price)?' desde '+new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(payload.price):'';status.textContent='Listo. Abriendo '+(payload.bookWith||'la comparación')+amount+'…';if(payload.postData){const form=document.createElement('form');form.method='post';form.action=payload.url;for(const [name,value] of new URLSearchParams(payload.postData)){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.appendChild(input)}document.body.appendChild(form);form.submit();return}window.location.replace(payload.url)}).catch(fail)})()</script></body></html>`, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
  return withSessionCookie(response, sessionId);
}

const sanitizeParam = (value: string | null): string | null =>
  value ? value.trim().slice(0, 200) : null;

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { dealId } = await params;
  const url = new URL(request.url);
  const sessionId = crypto.randomUUID();

  try {
    const deal = await getDealById(dealId);
    if (!deal) throw new Error("Drop no encontrado o no publicado");
    if (url.searchParams.get("resolve") === "1") {
      const booking = await new TravelpayoutsProvider({ requestTimeoutMs: 6_000 })
        .getBookingRequestForDeal(deal);
      if (booking) {
        return NextResponse.json({
          url: booking.url,
          postData: booking.postData,
          bookWith: booking.bookWith,
          price: booking.price,
        }, { headers: { "cache-control": "no-store" } });
      }
      return NextResponse.json({ error: "fare-unavailable" }, { status: 410, headers: { "cache-control": "no-store" } });
    }

    void recordDealClick({
      dealId,
      sessionId,
      source: sanitizeParam(url.searchParams.get("source")),
      referrer: sanitizeParam(request.headers.get("referer")),
      utmSource: sanitizeParam(url.searchParams.get("utm_source")),
      utmMedium: sanitizeParam(url.searchParams.get("utm_medium")),
      utmCampaign: sanitizeParam(url.searchParams.get("utm_campaign")),
    }).catch(() => undefined);
    try {
      captureServerEvent("deal_click_out", {
        distinct_id: sessionId,
        deal_id: dealId,
        source: sanitizeParam(url.searchParams.get("source")) ?? null,
      });
    } catch {
      // Analytics must never block the booking handoff.
    }

    return resolvingResponse(deal.id, deal.slug, sessionId);
  } catch {
    if (url.searchParams.get("resolve") === "1") {
      return NextResponse.json({ error: "fare-unavailable" }, { status: 410, headers: { "cache-control": "no-store" } });
    }
    return NextResponse.redirect(new URL("/?error=drop-unavailable", appBaseUrl), 303);
  }
}
