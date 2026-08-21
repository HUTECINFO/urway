import { getAirport } from "../demo/airports";
import { TripType, type Airport } from "../domain/types";
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

interface SerpApiResponse {
  error?: string;
  best_flights?: SerpFlightOffer[];
  other_flights?: SerpFlightOffer[];
  search_metadata?: { google_flights_url?: string };
}

export interface SerpApiProviderOptions {
  apiKey?: string;
  active?: boolean;
  fallbackProvider?: FlightDealProvider;
  endpoint?: string;
  fetch?: typeof fetch;
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

const secureBookingUrl = (value: string | undefined): string => {
  if (value) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:") return url.toString();
    } catch {
      return "https://www.google.com/travel/flights";
    }
  }
  return "https://www.google.com/travel/flights";
};

export class SerpApiProvider implements FlightDealProvider {
  readonly id = "serpapi";
  readonly name = "SerpAPI Google Flights";
  readonly isActive: boolean;
  private readonly apiKey?: string;
  private readonly fallbackProvider?: FlightDealProvider;
  private readonly endpoint: string;
  private readonly fetcher: typeof fetch;

  constructor(options: SerpApiProviderOptions = {}) {
    this.apiKey = options.apiKey?.trim() || environmentApiKey();
    this.isActive = options.active ?? true;
    this.fallbackProvider = options.fallbackProvider;
    this.endpoint = options.endpoint ?? "https://serpapi.com/search.json";
    this.fetcher = options.fetch ?? fetch;
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
    const bookingUrl = secureBookingUrl(data.search_metadata?.google_flights_url);
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
      return [{
        provider: this.id,
        providerDealId: offer.booking_token ?? offer.departure_token ?? `${origin.code}-${destination.code}-${index}`,
        origin,
        destination,
        departureDate: asIsoDate(firstLeg.departure_airport?.time, params.departureDateFrom),
        returnDate:
          params.tripType === TripType.ONE_WAY
            ? undefined
            : asIsoDate(undefined, params.returnDateFrom ?? params.returnDateTo ?? params.departureDateTo),
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
        bookingUrl,
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
