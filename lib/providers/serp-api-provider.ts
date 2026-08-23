import { getAirport } from "../demo/airports";
import { TripType, type Airport, type Deal } from "../domain/types";
import {
  ProviderConfigurationError,
  ProviderRequestError,
  type DealSearchParams,
  type FlightDealProvider,
  type NormalizedFlightDeal,
} from "./types";

interface SerpFlightLeg {
  departure_airport?: { name?: string; id?: string; time?: string };
  arrival_airport?: { name?: string; id?: string; time?: string };
  duration?: number;
  airplane?: string;
  airline?: string;
  airline_logo?: string;
  flight_number?: string;
  overnight?: boolean;
}

interface SerpFlightOffer {
  flights?: SerpFlightLeg[];
  layovers?: unknown[];
  total_duration?: number;
  price?: number;
  type?: string;
  booking_token?: string;
  departure_token?: string;
}

interface SerpBookingRequest {
  url?: string;
  post_data?: string;
}

interface SerpBookingOption {
  together?: {
    airline?: boolean;
    book_with?: string;
    price?: number;
    booking_request?: SerpBookingRequest;
  };
}

interface SerpApiResponse {
  error?: string;
  best_flights?: SerpFlightOffer[];
  other_flights?: SerpFlightOffer[];
  booking_options?: SerpBookingOption[];
}

export interface ProviderBookingRequest {
  url: string;
  postData?: string;
  bookWith?: string;
  price?: number;
}

export interface BookingLookup {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: TripType;
  currency: string;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
}

export interface SerpApiProviderOptions {
  apiKey?: string;
  active?: boolean;
  fallbackProvider?: FlightDealProvider;
  endpoint?: string;
  fetch?: typeof fetch;
  requestTimeoutMs?: number;
}

const environmentApiKey = (): string | undefined => {
  if (typeof process === "undefined") return undefined;
  return process.env.SERPAPI_KEY ?? process.env.SERPAPI_API_KEY ?? process.env.SERP_API_KEY;
};

const airportFromSerp = (id: string | undefined, name: string | undefined): Airport => {
  const code = id?.trim().toUpperCase();
  if (!code) throw new ProviderRequestError("serpapi", "SerpAPI returned a flight without an airport code");
  try {
    return getAirport(code);
  } catch {
    return {
      code,
      name: name?.trim() || `${code} Airport`,
      city: name?.split(" ")[0]?.trim() || code,
      country: "Unknown",
      countryCode: "XX",
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
    };
  }
};

const asIsoDate = (value: string | undefined, fallback: string): string => {
  const candidate = value ? new Date(value.replace(" ", "T")) : new Date(fallback);
  if (Number.isNaN(candidate.getTime())) return new Date(fallback).toISOString();
  return candidate.toISOString();
};

const bookingUrlFor = (
  origin: Airport,
  destination: Airport,
  departureDate: string,
  returnDate: string | undefined,
  currency: string,
): string => {
  const url = new URL("https://www.google.com/travel/flights");
  const query = `Flights from ${origin.code} to ${destination.code} on ${departureDate.slice(0, 10)}`;
  url.searchParams.set("q", returnDate ? `${query} through ${returnDate.slice(0, 10)}` : `${query} one way`);
  url.searchParams.set("hl", "es");
  url.searchParams.set("gl", "mx");
  url.searchParams.set("curr", currency);
  return url.toString();
};

const providerReferenceFor = (
  offer: SerpFlightOffer,
  origin: Airport,
  destination: Airport,
  departureDate: string,
  index: number,
): string => {
  const token = [offer.booking_token, offer.departure_token]
    .map((value) => value?.trim())
    .find((value) => value && value.length >= 2 && value.length <= 255);
  return token ?? `serpapi:${origin.code}:${destination.code}:${departureDate.slice(0, 10)}:${index}`;
};

export function isSerpApiBookingToken(value: string): boolean {
  const token = value.trim();
  return token.length >= 32 && token.length <= 2_048 && !token.startsWith("serpapi:");
}

const extractBookingRequest = (data: SerpApiResponse, targetPrice?: number): ProviderBookingRequest | null => {
  const options = (data.booking_options ?? [])
    .map((option) => option.together)
    .filter((option): option is NonNullable<SerpBookingOption["together"]> => Boolean(option?.booking_request));
  const option = [...options].sort((left, right) => {
    const leftDistance = targetPrice !== undefined && Number.isFinite(left.price)
      ? Math.abs((left.price as number) - targetPrice)
      : Number.MAX_SAFE_INTEGER;
    const rightDistance = targetPrice !== undefined && Number.isFinite(right.price)
      ? Math.abs((right.price as number) - targetPrice)
      : Number.MAX_SAFE_INTEGER;
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;
    return Number(Boolean(right.airline)) - Number(Boolean(left.airline));
  })[0];
  const request = option?.booking_request;
  if (!request?.url) return null;
  if (
    targetPrice !== undefined
    && Number.isFinite(option.price)
    && Math.abs((option.price as number) - targetPrice) > Math.max(500, targetPrice * 0.05)
  ) return null;

  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:") return null;
    return {
      url: url.toString(),
      ...(request.post_data?.trim() && { postData: request.post_data.trim() }),
      ...(option.book_with?.trim() && { bookWith: option.book_with.trim() }),
      ...(Number.isFinite(option.price) && { price: option.price }),
    };
  } catch {
    return null;
  }
};

const bookingTokenFrom = (data: SerpApiResponse, targetPrice?: number): string | null => {
  const offers = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];
  const token = [...offers]
    .sort((left, right) => targetPrice === undefined
      ? 0
      : Math.abs((left.price ?? Number.MAX_SAFE_INTEGER) - targetPrice)
        - Math.abs((right.price ?? Number.MAX_SAFE_INTEGER) - targetPrice))
    .map((offer) => offer.booking_token?.trim())
    .find((value) => value && isSerpApiBookingToken(value));
  return token ?? null;
};

const travelClassCode = (cabinClass: BookingLookup["cabinClass"]): string => String(
  { economy: 1, premium_economy: 2, business: 3, first: 4 }[cabinClass ?? "economy"],
);

const queryForLookup = (lookup: BookingLookup): URLSearchParams => {
  const query = new URLSearchParams({
    departure_id: lookup.origin,
    arrival_id: lookup.destination,
    outbound_date: lookup.departureDate.slice(0, 10),
    type: lookup.tripType === TripType.ONE_WAY ? "2" : "1",
    currency: lookup.currency.trim().toUpperCase() || "MXN",
    adults: "1",
    travel_class: travelClassCode(lookup.cabinClass),
    hl: "es",
    gl: "mx",
  });
  if (lookup.tripType !== TripType.ONE_WAY && lookup.returnDate) {
    query.set("return_date", lookup.returnDate.slice(0, 10));
  }
  return query;
};

const matchesFlightNumber = (offer: SerpFlightOffer, flightNumber: string | undefined): boolean => {
  if (!flightNumber) return false;
  const expected = flightNumber.replaceAll(/\s+/g, "").toUpperCase();
  return (offer.flights ?? []).some(
    (leg) => leg.flight_number?.replaceAll(/\s+/g, "").toUpperCase() === expected,
  );
};

const normalizeAirline = (value: string | undefined): string => value
  ?.normalize("NFD")
  .replaceAll(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase() ?? "";

const matchesAirline = (offer: SerpFlightOffer, airline: string): boolean => {
  const expected = normalizeAirline(airline);
  return Boolean(expected) && (offer.flights ?? []).some((leg) => normalizeAirline(leg.airline) === expected);
};

export class SerpApiProvider implements FlightDealProvider {
  readonly id = "serpapi";
  readonly name = "SerpAPI Google Flights";
  readonly isActive: boolean;
  private readonly apiKey?: string;
  private readonly fallbackProvider?: FlightDealProvider;
  private readonly endpoint: string;
  private readonly fetcher: typeof fetch;
  private readonly requestTimeoutMs: number;

  constructor(options: SerpApiProviderOptions = {}) {
    this.apiKey = options.apiKey?.trim() || environmentApiKey();
    this.isActive = options.active ?? true;
    this.fallbackProvider = options.fallbackProvider;
    this.endpoint = options.endpoint ?? "https://serpapi.com/search.json";
    this.fetcher = options.fetch ?? fetch;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 5_000;
  }

  private async fetchTokenResponse(
    tokenType: "booking_token" | "departure_token",
    token: string,
    lookup: BookingLookup,
  ): Promise<SerpApiResponse | null> {
    const query = queryForLookup(lookup);
    query.set("engine", "google_flights");
    query.set("api_key", this.apiKey!);
    query.set(tokenType, token);

    try {
      const response = await this.fetcher(`${this.endpoint}?${query.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as SerpApiResponse;
      return data.error ? null : data;
    } catch {
      return null;
    }
  }

  private async fetchItinerary(lookup: BookingLookup): Promise<SerpApiResponse | null> {
    const query = queryForLookup(lookup);
    query.set("engine", "google_flights");
    query.set("api_key", this.apiKey!);

    try {
      const response = await this.fetcher(`${this.endpoint}?${query.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as SerpApiResponse;
      return data.error ? null : data;
    } catch {
      return null;
    }
  }

  async getBookingRequest(
    bookingToken: string,
    lookup: BookingLookup,
    targetPrice?: number,
    tokenType: "booking_token" | "departure_token" = lookup.tripType === TripType.ROUND_TRIP
      ? "departure_token"
      : "booking_token",
  ): Promise<ProviderBookingRequest | null> {
    if (!this.apiKey || !this.isActive || !isSerpApiBookingToken(bookingToken)) return null;
    if (tokenType === "departure_token") {
      const returningFlights = await this.fetchTokenResponse("departure_token", bookingToken, lookup);
      const returnBookingToken = returningFlights ? bookingTokenFrom(returningFlights, targetPrice) : null;
      if (!returnBookingToken) return null;
      const bookingOptions = await this.fetchTokenResponse("booking_token", returnBookingToken, lookup);
      return bookingOptions ? extractBookingRequest(bookingOptions, targetPrice) : null;
    }

    const directResponse = await this.fetchTokenResponse("booking_token", bookingToken, lookup);
    return directResponse ? extractBookingRequest(directResponse, targetPrice) : null;
  }

  async getBookingRequestForDeal(deal: Pick<Deal, "origin" | "destination" | "travelStartDate" | "travelEndDate" | "tripType" | "currency" | "flightNumber" | "cabinClass" | "airline" | "price" | "provider" | "providerDealId">): Promise<ProviderBookingRequest | null> {
    if (!this.apiKey || !this.isActive || deal.provider !== this.id) return null;
    const departureTime = new Date(deal.travelStartDate).getTime();
    if (!Number.isFinite(departureTime) || departureTime < Date.now() - 4 * 3_600_000) return null;
    const cabinClass = deal.cabinClass === "premium_economy" || deal.cabinClass === "business" || deal.cabinClass === "first" || deal.cabinClass === "economy"
      ? deal.cabinClass
      : "economy";
    const lookup: BookingLookup = {
      origin: deal.origin.code,
      destination: deal.destination.code,
      departureDate: deal.travelStartDate,
      returnDate: deal.tripType === TripType.ROUND_TRIP ? deal.travelEndDate : undefined,
      tripType: deal.tripType,
      currency: deal.currency,
      cabinClass,
    };

    if (isSerpApiBookingToken(deal.providerDealId)) {
      const storedBooking = await this.getBookingRequest(deal.providerDealId, lookup, deal.price);
      if (storedBooking) return storedBooking;
    }

    const search = await this.fetchItinerary(lookup);
    const offers = [...(search?.best_flights ?? []), ...(search?.other_flights ?? [])];
    const selected = [...offers].sort((left, right) => {
      const score = (offer: SerpFlightOffer) =>
        (matchesFlightNumber(offer, deal.flightNumber) ? 1_000_000 : 0)
        + (matchesAirline(offer, deal.airline) ? 100_000 : 0)
        - Math.abs((offer.price ?? Number.MAX_SAFE_INTEGER) - deal.price);
      return score(right) - score(left);
    })[0];
    const token = selected?.booking_token ?? selected?.departure_token;
    const tokenType = selected?.booking_token ? "booking_token" : "departure_token";
    return token && isSerpApiBookingToken(token)
      ? this.getBookingRequest(token, lookup, deal.price, tokenType)
      : null;
  }

  async fetchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]> {
    if (!this.isActive) return [];
    if (!this.apiKey) {
      if (this.fallbackProvider?.isActive) return this.fallbackProvider.fetchDeals(params);
      throw new ProviderConfigurationError(
        this.id,
        "SerpAPI is not configured. Set SERPAPI_KEY or provide a fallbackProvider.",
      );
    }
    if (params.origins.length === 0 || !params.destinations?.length) {
      throw new RangeError("SerpAPI searches require at least one origin and destination");
    }
    const query = new URLSearchParams({
      engine: "google_flights",
      api_key: this.apiKey,
      departure_id: params.origins.join(","),
      arrival_id: params.destinations.join(","),
      outbound_date: params.departureDateFrom.slice(0, 10),
      type: params.tripType === TripType.ONE_WAY ? "2" : "1",
      currency: params.currency?.trim().toUpperCase() || "MXN",
      adults: String(params.adults ?? 1),
      travel_class: String(
        { economy: 1, premium_economy: 2, business: 3, first: 4 }[
          params.cabinClass ?? "economy"
        ],
      ),
    });
    if (params.tripType !== TripType.ONE_WAY) {
      const returnDate = params.returnDateFrom ?? params.returnDateTo;
      if (!returnDate) throw new RangeError("Round-trip SerpAPI searches require a return date");
      query.set("return_date", returnDate.slice(0, 10));
    }
    let response: Response;
    try {
      response = await this.fetcher(`${this.endpoint}?${query.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });
    } catch (error) {
      throw new ProviderRequestError(
        this.id,
        `SerpAPI request failed: ${error instanceof Error ? error.message : "network error"}`,
      );
    }
    if (!response.ok) {
      throw new ProviderRequestError(
        this.id,
        `SerpAPI request failed with HTTP ${response.status}`,
        response.status,
      );
    }
    const data = (await response.json()) as SerpApiResponse;
    if (data.error) throw new ProviderRequestError(this.id, `SerpAPI error: ${data.error}`);
    const offers = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];
    const currency = params.currency?.trim().toUpperCase() || "MXN";
    const normalized = offers.flatMap((offer, index): NormalizedFlightDeal[] => {
      const legs = offer.flights ?? [];
      const firstLeg = legs[0];
      const lastLeg = legs.at(-1);
      if (!firstLeg || !lastLeg || !Number.isFinite(offer.price)) return [];
      const origin = airportFromSerp(
        firstLeg.departure_airport?.id,
        firstLeg.departure_airport?.name,
      );
      const destination = airportFromSerp(
        lastLeg.arrival_airport?.id,
        lastLeg.arrival_airport?.name,
      );
      const departureDate = asIsoDate(firstLeg.departure_airport?.time, params.departureDateFrom);
      const returnDate =
        params.tripType === TripType.ONE_WAY
          ? undefined
          : asIsoDate(undefined, params.returnDateFrom ?? params.returnDateTo ?? params.departureDateTo);
      return [{
        provider: this.id,
        providerDealId: providerReferenceFor(offer, origin, destination, departureDate, index),
        origin,
        destination,
        departureDate,
        returnDate,
        tripType: params.tripType,
        price: offer.price as number,
        currency,
        airline: firstLeg.airline?.trim() || "Multiple airlines",
        flightNumber: firstLeg.flight_number,
        stops: Math.max(0, legs.length - 1),
        durationMinutes:
          offer.total_duration ?? legs.reduce((sum, leg) => sum + (leg.duration ?? 0), 0),
        overnight: legs.some((leg) => leg.overnight),
        cabinClass: params.cabinClass ?? "economy",
        bookingUrl: bookingUrlFor(origin, destination, departureDate, returnDate, currency),
        metadata: { offerType: offer.type, airplane: firstLeg.airplane },
      }];
    });
    const withinBudget = normalized.filter(
      (deal) => params.maxPrice === undefined || deal.price <= params.maxPrice,
    );
    return withinBudget.slice(0, params.limit ?? withinBudget.length);
  }

  async searchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]> {
    return this.fetchDeals(params);
  }
}
