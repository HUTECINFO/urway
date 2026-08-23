import { NextResponse } from "next/server";
import { listPublishedDeals } from "@/lib/data/deals";
import { DEMO_AIRPORTS } from "@/lib/demo/airports";
import { RATE_LIMITS, getClientKey, isRateLimited, rateLimitResponse } from "@/lib/security/rate-limit";

const publicOrigins = new Set<string>(
  DEMO_AIRPORTS.filter((airport) => airport.countryCode === "MX").map((airport) => airport.code),
);

export async function GET(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited("deals-api", clientKey, RATE_LIMITS.dealsApi)) {
    return rateLimitResponse(60);
  }

  const url = new URL(request.url);
  if (url.searchParams.toString().length > 500) {
    return NextResponse.json({ ok: false, message: "Solicitud no válida." }, { status: 414 });
  }

  const originParam = url.searchParams.get("origin")?.trim().toUpperCase();
  if (originParam && !publicOrigins.has(originParam)) {
    return NextResponse.json({ ok: false, message: "El aeropuerto de salida no es válido." }, { status: 400 });
  }

  try {
    const deals = await listPublishedDeals(originParam || undefined);
    const data = deals.map((deal) => ({
      id: deal.id,
      slug: deal.slug,
      title: deal.title,
      shortCopy: deal.shortCopy,
      dealType: deal.dealType,
      origin: deal.origin,
      destination: deal.destination,
      price: deal.price,
      normalPrice: deal.normalPrice,
      currency: deal.currency,
      savings: deal.savings,
      savingsPercentage: deal.savingsPercentage,
      airline: deal.airline,
      stops: deal.stops,
      durationMinutes: deal.durationMinutes,
      durationDays: deal.durationDays,
      travelStartDate: deal.travelStartDate,
      travelEndDate: deal.travelEndDate,
      imageUrl: deal.imageUrl,
      score: deal.score,
      tags: deal.tags,
      featured: deal.featured,
      verifiedAt: deal.verifiedAt,
      publishedAt: deal.publishedAt,
    }));
    return NextResponse.json(
      { ok: true, count: data.length, deals: data },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } },
    );
  } catch {
    return NextResponse.json({ ok: false, message: "No pudimos cargar los Drops." }, { status: 500 });
  }
}
