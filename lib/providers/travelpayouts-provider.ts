import { getAirport } from "@/lib/demo/airports";
import { TripType, type Airport, type Deal } from "@/lib/domain/types";
import type { ProviderBookingRequest } from "@/lib/providers/serp-api-provider";
import type {
  DealSearchParams,
  FlightDealProvider,
  NormalizedFlightDeal,
} from "@/lib/providers/types";

interface TravelpayoutsOffer {
  origin?: string;
  destination?: string;
  price?: number;
  airline?: string;
  flight_number?: string;
  departure_at?: string;
  return_at?: string;
  transfers?: number;
  duration?: number;
  link?: string;
}

interface TravelpayoutsResponse {
  success?: boolean;
  data?: TravelpayoutsOffer[];
  error?: string | null;
}

export interface TravelpayoutsProviderOptions {
  token?: string;
  marker?: string;
  endpoint?: string;
  fetch?: typeof fetch;
  requestTimeoutMs?: number;
  active?: boolean;
}

type BookingDeal = Pick<
  Deal,
  | "origin"
  | "destination"
  | "travelStartDate"
  | "travelEndDate"
  | "tripType"
  | "currency"
  | "cabinClass"
  | "price"
>;

const environmentToken = () => process.env.TRAVELPAYOUTS_API_TOKEN?.trim()
  || process.env.TRAVELPAYOUTS_TOKEN?.trim();

const environmentMarker = () => process.env.TRAVELPAYOUTS_MARKER?.trim()
  || process.env.TRAVELPAYOUTS_PARTNER_ID?.trim()
  || "768547";

const datePart = (value: string): string => value.slice(0, 10);

const asIsoDate = (value: string | undefined, fallback: string): string => {
  const candidate = value ? new Date(value) : new Date(fallback);
  return Number.isNaN(candidate.getTime()) ? new Date(fallback).toISOString() : candidate.toISOString();
};

const safeAirport = (code: string, fallback?: Airport): Airport | null => {
  try {
    return getAirport(code);
  } catch {
    return fallback ?? null;
  }
};

const dayMonth = (value: string): string => {
  const [year, month, day] = datePart(value).split("-");
  if (!year || !month || !day) throw new RangeError("Fecha de vuelo inválida");
  return `${day}${month}`;
};

const cabinCode = (value: string | undefined): string => {
  if (value === "business") return "c";
  if (value === "premium_economy") return "w";
  if (value === "first") return "f";
  return "";
};

const withMarker = (url: URL, marker: string | undefined): URL => {
  if (marker) url.searchParams.set("marker", `${marker}.urway_drop`);
  return url;
};

export function buildAviasalesSearchUrl(deal: BookingDeal, marker?: string): URL {
  const returnPart = deal.tripType === TripType.ROUND_TRIP
    ? dayMonth(deal.travelEndDate)
    : "";
  const search = [
    deal.origin.code,
    dayMonth(deal.travelStartDate),
    deal.destination.code,
    returnPart,
    cabinCode(deal.cabinClass),
    "1",
  ].join("");
  return withMarker(new URL(`/search/${search}`, "https://www.aviasales.com"), marker);
}

const offerUrl = (link: string | undefined, marker: string | undefined): URL | null => {
  if (!link?.trim()) return null;
  try {
    const url = new URL(link, "https://www.aviasales.com");
    if (url.protocol !== "https:" || !/(^|\.)aviasales\.(com|ru)$/.test(url.hostname)) return null;
    return withMarker(url, marker);
  } catch {
    return null;
  }
};

const priceIsClose = (price: number | undefined, target: number): price is number =>
  Number.isFinite(price) && Math.abs((price as number) - target) <= Math.max(500, target * 0.05);

export class TravelpayoutsProvider implements FlightDealProvider {
  readonly id = "travelpayouts";
  readonly name = "Travelpayouts Aviasales Data API";
  readonly isActive: boolean;
  private readonly token?: string;
  private readonly marker?: string;
  private readonly endpoint: string;
  private readonly fetcher: typeof fetch;
  private readonly requestTimeoutMs: number;

  constructor(options: TravelpayoutsProviderOptions = {}) {
    this.token = options.token?.trim() || environmentToken();
    this.marker = options.marker?.trim() || environmentMarker();
    this.endpoint = options.endpoint ?? "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";
    this.fetcher = options.fetch ?? fetch;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 6_000;
    this.isActive = options.active ?? Boolean(this.token);
  }

  private async fetchRouteOffers(
    originCode: string,
    destinationCode: string | undefined,
    params: DealSearchParams,
  ): Promise<TravelpayoutsOffer[]> {
    if (!this.token) return [];
    const query = new URLSearchParams({
      origin: originCode,
      departure_at: params.departureDateFrom.slice(0, 7),
      currency: (params.currency ?? "MXN").toLowerCase(),
      unique: "false",
      sorting: "price",
      direct: "false",
      show_to_affiliates: "true",
      limit: destinationCode ? "30" : "100",
      page: "1",
      one_way: String(params.tripType === TripType.ONE_WAY),
    });
    if (destinationCode) query.set("destination", destinationCode);
    if (params.tripType === TripType.ROUND_TRIP && params.returnDateFrom) {
      query.set("return_at", params.returnDateFrom.slice(0, 7));
    }
    const response = await this.fetcher(`${this.endpoint}?${query.toString()}`, {
      headers: { Accept: "application/json", "X-Access-Token": this.token },
      signal: AbortSignal.timeout(this.requestTimeoutMs),
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as TravelpayoutsResponse;
    return payload.success && Array.isArray(payload.data) ? payload.data : [];
  }

  async fetchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]> {
    if (!this.isActive || !this.token) return [];
    const routes = params.destinations?.length
      ? params.origins.flatMap((origin) =>
          params.destinations!.map((destination) => ({ origin, destination })),
        )
      : params.origins.map((origin) => ({ origin, destination: undefined }));
    const settled = await Promise.allSettled(
      routes.map(({ origin, destination }) => this.fetchRouteOffers(origin, destination, params)),
    );
    const departureFrom = new Date(params.departureDateFrom).getTime();
    const departureTo = new Date(params.departureDateTo).getTime();
    const returnFrom = params.returnDateFrom ? new Date(params.returnDateFrom).getTime() : undefined;
    const returnTo = params.returnDateTo ? new Date(params.returnDateTo).getTime() : undefined;
    const currency = params.currency?.trim().toUpperCase() || "MXN";
    const deals: NormalizedFlightDeal[] = [];

    settled.forEach((result, index) => {
      if (result.status !== "fulfilled") return;
      const route = routes[index];
      const origin = safeAirport(route.origin, getAirport("MEX"));
      if (!origin) return;
      result.value.forEach((offer, offerIndex) => {
        if (!Number.isFinite(offer.price) || !offer.link) return;
        const destinationCode = offer.destination?.trim().toUpperCase() || route.destination;
        if (!destinationCode) return;
        const destination = safeAirport(destinationCode);
        if (!destination || destination.countryCode === "MX") return;
        const departureDate = asIsoDate(offer.departure_at, params.departureDateFrom);
        const returnDate = params.tripType === TripType.ONE_WAY
          ? undefined
          : asIsoDate(offer.return_at, params.returnDateFrom ?? params.departureDateFrom);
        const departureTime = new Date(departureDate).getTime();
        const returnTime = returnDate ? new Date(returnDate).getTime() : undefined;
        if (departureTime < departureFrom || departureTime > departureTo) return;
        if (params.tripType === TripType.ROUND_TRIP && (!returnTime || returnTime <= departureTime)) return;
        if (returnFrom !== undefined && returnTime !== undefined && returnTime < returnFrom) return;
        if (returnTo !== undefined && returnTime !== undefined && returnTime > returnTo) return;
        if (params.maxPrice !== undefined && (offer.price as number) > params.maxPrice) return;
        const url = offerUrl(offer.link, this.marker);
        if (!url) return;
        deals.push({
          provider: this.id,
          providerDealId: `tp-${route.origin}-${destinationCode}-${datePart(departureDate)}-${Math.round(offer.price as number)}-${offerIndex}`.slice(0, 255),
          origin,
          destination,
          departureDate,
          returnDate,
          tripType: params.tripType,
          price: offer.price as number,
          currency,
          airline: offer.airline?.trim() || "Aviasales",
          flightNumber: offer.flight_number?.trim(),
          stops: Math.max(0, Math.round(offer.transfers ?? 0)),
          durationMinutes: Math.max(1, Math.round(offer.duration ?? 1)),
          cabinClass: params.cabinClass ?? "economy",
          bookingUrl: url.toString(),
          expiresAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
          metadata: { source: "travelpayouts-data-api", showToAffiliates: true },
        });
      });
    });
    return deals.slice(0, params.limit ?? deals.length);
  }

  async searchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]> {
    return this.fetchDeals(params);
  }

  async getBookingRequestForDeal(deal: BookingDeal): Promise<ProviderBookingRequest> {
    const fallback: ProviderBookingRequest = {
      url: buildAviasalesSearchUrl(deal, this.marker).toString(),
      bookWith: "Aviasales",
    };
    if (!this.token) return fallback;

    const query = new URLSearchParams({
      origin: deal.origin.code,
      destination: deal.destination.code,
      departure_at: datePart(deal.travelStartDate),
      currency: deal.currency.toLowerCase(),
      unique: "false",
      sorting: "price",
      direct: "false",
      limit: "30",
      page: "1",
      one_way: String(deal.tripType === TripType.ONE_WAY),
    });
    if (deal.tripType === TripType.ROUND_TRIP) {
      query.set("return_at", datePart(deal.travelEndDate));
    }

    try {
      const response = await this.fetcher(`${this.endpoint}?${query.toString()}`, {
        headers: { Accept: "application/json", "X-Access-Token": this.token },
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });
      if (!response.ok) return fallback;
      const payload = (await response.json()) as TravelpayoutsResponse;
      if (!payload.success || !Array.isArray(payload.data)) return fallback;

      const selected = [...payload.data]
        .filter((offer) => priceIsClose(offer.price, deal.price) && Boolean(offerUrl(offer.link, this.marker)))
        .sort((left, right) => Math.abs((left.price as number) - deal.price) - Math.abs((right.price as number) - deal.price))[0];
      const url = offerUrl(selected?.link, this.marker);
      if (!selected || !url || !priceIsClose(selected.price, deal.price)) return fallback;

      return {
        url: url.toString(),
        bookWith: "Aviasales",
        price: selected.price,
      };
    } catch {
      return fallback;
    }
  }
}
