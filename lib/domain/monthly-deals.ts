import { DealStatus, type Deal } from "./types";

const monthFormatter = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const monthKey = (value: string): string => new Date(value).toISOString().slice(0, 7);

const formatPrice = (price: number): string =>
  Math.round(price).toLocaleString("es-MX");

const cheapestFirst = (left: Deal, right: Deal): number =>
  left.price - right.price
    || right.score.total - left.score.total
    || new Date(left.travelStartDate).getTime() - new Date(right.travelStartDate).getTime();

export interface MonthlyDealGroup {
  key: string;
  month: string;
  destination: string;
  offerCount: number;
  deal: Deal;
}

export function groupDealsByDestinationMonth(
  deals: readonly Deal[],
  now = new Date(),
): MonthlyDealGroup[] {
  const groups = new Map<string, Deal[]>();

  for (const deal of deals) {
    const month = monthKey(deal.travelStartDate);
    const destination = slugify(deal.destination.city);
    const key = `${destination}:${month}`;
    const current = groups.get(key) ?? [];
    current.push(deal);
    groups.set(key, current);
  }

  const timestamp = now.toISOString();

  return [...groups.entries()]
    .map(([key, offers]) => {
      const ranked = [...offers].sort(cheapestFirst);
      const cheapest = ranked[0];
      const month = monthKey(cheapest.travelStartDate);
      const [year, monthNumber] = month.split("-").map(Number);
      const monthName = monthFormatter.format(new Date(Date.UTC(year, monthNumber - 1, 1)));
      const destinationKey = slugify(cheapest.destination.city);
      const providerDealId = `tp-month-${destinationKey}-${month}`;
      const fingerprint = `travelpayouts-month:${destinationKey}:${month}`;
      const routeDates = `${dateFormatter.format(new Date(cheapest.travelStartDate))}–${dateFormatter.format(new Date(cheapest.travelEndDate))}`;
      const offerCount = ranked.length;
      const groupedDeal: Deal = {
        ...cheapest,
        id: fingerprint,
        providerDealId,
        fingerprint,
        slug: `${destinationKey}-${slugify(monthName)}-${year}`,
        title: `${cheapest.destination.city} en ${monthName} desde $${formatPrice(cheapest.price)} MXN`,
        description: `Agrupamos ${offerCount} ${offerCount === 1 ? "tarifa" : "tarifas"} para viajar a ${cheapest.destination.city} en ${monthName}. La opción más barata encontrada sale de ${cheapest.origin.city} por $${formatPrice(cheapest.price)} MXN; el precio y la disponibilidad se confirman con Aviasales.`,
        shortCopy: `${monthName}: ${cheapest.origin.code} → ${cheapest.destination.code}, ${routeDates}, desde $${formatPrice(cheapest.price)} MXN.`,
        status: DealStatus.PUBLISHED,
        publishedAt: timestamp,
        detectedAt: timestamp,
        verifiedAt: timestamp,
        updatedAt: timestamp,
        expiresAt: new Date(now.getTime() + 24 * 3_600_000).toISOString(),
        tags: [
          cheapest.destination.country,
          `${monthName} ${year}`,
          `${offerCount} ${offerCount === 1 ? "tarifa comparada" : "tarifas comparadas"}`,
        ],
      };

      return {
        key,
        month,
        destination: cheapest.destination.city,
        offerCount,
        deal: groupedDeal,
      };
    })
    .sort((left, right) => left.month.localeCompare(right.month) || cheapestFirst(left.deal, right.deal));
}
