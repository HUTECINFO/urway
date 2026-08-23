import { TripType, type Deal } from "@/lib/domain/types";
import type { ProviderBookingRequest } from "@/lib/providers/serp-api-provider";

interface TravelpayoutsOffer {
  origin?: string;
  destination?: string;
  price?: number;
  airline?: string;
  flight_number?: string;
  departure_at?: string;
  return_at?: string;
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
  || process.env.TRAVELPAYOUTS_PARTNER_ID?.trim();

const datePart = (value: string): string => value.slice(0, 10);

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

export class TravelpayoutsProvider {
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
