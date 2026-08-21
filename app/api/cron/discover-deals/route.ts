import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { saveDiscoveredDeals } from "@/lib/data/deals";
import { discoverDeals } from "@/lib/domain/discover-deals";
import { TripType } from "@/lib/domain/types";
import { createDefaultProviderRegistry } from "@/lib/providers/registry";

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const departureFrom = new Date(now.getTime() + 21 * 86_400_000);
  const departureTo = new Date(now.getTime() + 120 * 86_400_000);
  const returnFrom = new Date(departureFrom.getTime() + 5 * 86_400_000);
  const returnTo = new Date(departureTo.getTime() + 14 * 86_400_000);
  const registry = createDefaultProviderRegistry({
    mock: true,
    serpApi: process.env.SERPAPI_KEY ? { active: true } : false,
  });
  const result = await discoverDeals({
    origins: ["MEX", "NLU", "GDL", "MTY", "BJX", "QRO", "TIJ", "CUN"],
    destinations: ["NRT", "MAD", "JFK", "CDG", "YVR", "LIM"],
    departureDateFrom: departureFrom.toISOString(),
    departureDateTo: departureTo.toISOString(),
    returnDateFrom: returnFrom.toISOString(),
    returnDateTo: returnTo.toISOString(),
    tripType: TripType.ROUND_TRIP,
    currency: "MXN",
    limit: 30,
  }, { registry, now, allowPartialResults: true, minimumReviewScore: 60 });
  const inserted = await saveDiscoveredDeals(result.deals);

  return NextResponse.json({
    ok: true,
    inserted,
    discovered: result.rawDealCount,
    review: result.reviewCount,
    duplicates: result.duplicateCount,
    providerFailures: result.failures.map(({ providerId, message }) => ({ providerId, message })),
  });
}
