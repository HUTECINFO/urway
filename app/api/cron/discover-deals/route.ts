import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { saveDiscoveredDeals } from "@/lib/data/deals";
import { discoverDeals } from "@/lib/domain/discover-deals";
import { TripType } from "@/lib/domain/types";
import { createDefaultProviderRegistry } from "@/lib/providers/registry";

const MEXICAN_ORIGINS = ["MEX", "NLU", "GDL", "MTY", "BJX", "QRO", "TIJ", "CUN"];

const DESTINATION_RADARS = [
  { name: "Europa", destinations: ["LHR", "LIS", "IST", "ATH", "DUB"] },
  { name: "Asia y Golfo", destinations: ["DXB", "DOH", "BKK", "ICN", "SIN"] },
  { name: "América y África", destinations: ["SCL", "MVD", "UIO", "PTY", "CPT"] },
] as const;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const departureFrom = new Date(now.getTime() + 21 * 86_400_000);
  const departureTo = new Date(now.getTime() + 120 * 86_400_000);
  const returnFrom = new Date(departureFrom.getTime() + 5 * 86_400_000);
  const returnTo = new Date(departureTo.getTime() + 14 * 86_400_000);
  const registry = createDefaultProviderRegistry({
    mock: false,
    serpApi: false,
    travelPayouts: process.env.TRAVELPAYOUTS_API_TOKEN
      ? { active: true }
      : false,
  });
  const results = await Promise.all(DESTINATION_RADARS.map(({ destinations }) => discoverDeals({
    origins: MEXICAN_ORIGINS,
    destinations,
    departureDateFrom: departureFrom.toISOString(),
    departureDateTo: departureTo.toISOString(),
    returnDateFrom: returnFrom.toISOString(),
    returnDateTo: returnTo.toISOString(),
    tripType: TripType.ROUND_TRIP,
    currency: "MXN",
    limit: 20,
  }, { registry, now, allowPartialResults: true, minimumReviewScore: 60 })));
  const uniqueDeals = [...new Map(results.flatMap((result) => result.deals).map((deal) => [deal.fingerprint, deal])).values()];
  const inserted = await saveDiscoveredDeals(uniqueDeals);

  return NextResponse.json({
    ok: true,
    inserted,
    searchedRegions: DESTINATION_RADARS.map(({ name, destinations }) => ({ name, destinations })),
    discovered: results.reduce((total, result) => total + result.rawDealCount, 0),
    review: results.reduce((total, result) => total + result.reviewCount, 0),
    duplicates: results.reduce((total, result) => total + result.duplicateCount, 0) + (results.flatMap((result) => result.deals).length - uniqueDeals.length),
    providerFailures: results.flatMap((result) => result.failures.map(({ providerId, message }) => ({ providerId, message }))),
  });
}
