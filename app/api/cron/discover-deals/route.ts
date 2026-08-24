import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { replacePublishedDeals } from "@/lib/data/deals";
import { discoverDeals } from "@/lib/domain/discover-deals";
import { groupDealsByDestinationMonth } from "@/lib/domain/monthly-deals";
import { TripType } from "@/lib/domain/types";
import { createDefaultProviderRegistry } from "@/lib/providers/registry";

export const maxDuration = 60;

const MEXICAN_ORIGINS = ["MEX", "NLU", "GDL", "MTY", "BJX", "QRO", "TIJ", "CUN"];
const MONTHS_TO_SEARCH = 12;

interface MonthWindow {
  key: string;
  start: string;
  end: string;
}

function upcomingMonthWindows(now: Date): MonthWindow[] {
  return Array.from({ length: MONTHS_TO_SEARCH }, (_, index) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + index + 1, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return {
      key: start.toISOString().slice(0, 7),
      start: start.toISOString(),
      end: end.toISOString(),
    };
  });
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.TRAVELPAYOUTS_API_TOKEN?.trim()) {
    return NextResponse.json({ error: "Travelpayouts no está configurado" }, { status: 503 });
  }

  const now = new Date();
  const months = upcomingMonthWindows(now);
  const registry = createDefaultProviderRegistry({
    mock: false,
    serpApi: false,
    travelPayouts: { active: true },
  });
  const results = await Promise.all(months.map((month) => discoverDeals({
    origins: MEXICAN_ORIGINS,
    departureDateFrom: month.start,
    departureDateTo: month.end,
    tripType: TripType.ROUND_TRIP,
    currency: "MXN",
    limit: 800,
  }, { registry, now, allowPartialResults: true, minimumReviewScore: 0 })));

  const groups = groupDealsByDestinationMonth(
    results.flatMap((result) => result.deals),
    now,
  );
  if (groups.length === 0) {
    return NextResponse.json({
      ok: false,
      error: "Travelpayouts no devolvió tarifas publicables; se conservó el catálogo actual",
      searchedMonths: months.map((month) => month.key),
      providerFailures: results.flatMap((result) => result.failures.map(({ providerId, message }) => ({ providerId, message }))),
    }, { status: 503 });
  }

  const publication = await replacePublishedDeals(groups.map((group) => group.deal));
  const byMonth = Object.fromEntries(months.map((month) => [
    month.key,
    groups
      .filter((group) => group.month === month.key)
      .sort((left, right) => left.deal.price - right.deal.price)
      .map((group) => ({
        destination: group.destination,
        offersCompared: group.offerCount,
        price: group.deal.price,
        origin: group.deal.origin.code,
        departure: group.deal.travelStartDate.slice(0, 10),
        return: group.deal.travelEndDate.slice(0, 10),
      })),
  ]));

  return NextResponse.json({
    ok: true,
    searchedMonths: months.map((month) => month.key),
    offersFound: results.reduce((total, result) => total + result.rawDealCount, 0),
    monthlyPosts: groups.length,
    saved: publication.saved,
    expired: publication.expired,
    byMonth,
    providerFailures: results.flatMap((result) => result.failures.map(({ providerId, message }) => ({ providerId, message }))),
  });
}
