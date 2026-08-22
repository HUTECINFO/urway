import { getAirport } from "../demo/airports";
import { TripType } from "../domain/types";
import { getCountryImageUrl } from "../media/country-images";
import type {
  DealSearchParams,
  FlightDealProvider,
  NormalizedFlightDeal,
} from "./types";

interface MockDealTemplate {
  destination: string;
  airline: string;
  flightNumber: string;
  price: number;
  originalPrice: number;
  stops: number;
  durationMinutes: number;
  departureHour: number;
  tripLengthDays: number;
  imageUrl: string;
}

const TEMPLATES: readonly MockDealTemplate[] = [
  { destination: "NRT", airline: "Aeroméxico", flightNumber: "AM58", price: 10890, originalPrice: 18990, stops: 0, durationMinutes: 870, departureHour: 23, tripLengthDays: 10, imageUrl: getCountryImageUrl("JP") },
  { destination: "MAD", airline: "Iberia", flightNumber: "IB304", price: 9490, originalPrice: 16990, stops: 0, durationMinutes: 660, departureHour: 20, tripLengthDays: 9, imageUrl: getCountryImageUrl("ES") },
  { destination: "MAD", airline: "Aeroméxico", flightNumber: "AM34", price: 11990, originalPrice: 19490, stops: 1, durationMinutes: 845, departureHour: 18, tripLengthDays: 8, imageUrl: getCountryImageUrl("ES") },
  { destination: "JFK", airline: "Viva", flightNumber: "VB100", price: 4190, originalPrice: 7790, stops: 0, durationMinutes: 305, departureHour: 7, tripLengthDays: 5, imageUrl: getCountryImageUrl("US") },
  { destination: "CDG", airline: "Air France", flightNumber: "AF179", price: 10990, originalPrice: 19990, stops: 1, durationMinutes: 850, departureHour: 19, tripLengthDays: 9, imageUrl: getCountryImageUrl("FR") },
  { destination: "YVR", airline: "Air Canada", flightNumber: "AC996", price: 5490, originalPrice: 9490, stops: 0, durationMinutes: 300, departureHour: 8, tripLengthDays: 6, imageUrl: getCountryImageUrl("CA") },
  { destination: "LIM", airline: "LATAM", flightNumber: "LA2473", price: 6990, originalPrice: 11990, stops: 0, durationMinutes: 355, departureHour: 16, tripLengthDays: 7, imageUrl: getCountryImageUrl("PE") },
  { destination: "BOG", airline: "Volaris", flightNumber: "Y43912", price: 4590, originalPrice: 8290, stops: 0, durationMinutes: 275, departureHour: 10, tripLengthDays: 5, imageUrl: getCountryImageUrl("CO") },
  { destination: "EZE", airline: "Copa Airlines", flightNumber: "CM195", price: 12490, originalPrice: 20990, stops: 1, durationMinutes: 825, departureHour: 6, tripLengthDays: 10, imageUrl: getCountryImageUrl("AR") },
  { destination: "LAX", airline: "Volaris", flightNumber: "Y41710", price: 3290, originalPrice: 6190, stops: 0, durationMinutes: 205, departureHour: 9, tripLengthDays: 4, imageUrl: getCountryImageUrl("US") },
  { destination: "LAS", airline: "Viva", flightNumber: "VB602", price: 2990, originalPrice: 5790, stops: 0, durationMinutes: 190, departureHour: 13, tripLengthDays: 3, imageUrl: getCountryImageUrl("US") },
  { destination: "FCO", airline: "Aeroméxico", flightNumber: "AM70", price: 12990, originalPrice: 22490, stops: 1, durationMinutes: 900, departureHour: 21, tripLengthDays: 10, imageUrl: getCountryImageUrl("IT") },
  { destination: "SJO", airline: "Volaris", flightNumber: "Y43120", price: 3890, originalPrice: 6990, stops: 0, durationMinutes: 180, departureHour: 11, tripLengthDays: 5, imageUrl: getCountryImageUrl("CR") },
  { destination: "HAV", airline: "Viva", flightNumber: "VB312", price: 3490, originalPrice: 6490, stops: 0, durationMinutes: 170, departureHour: 14, tripLengthDays: 5, imageUrl: getCountryImageUrl("CU") },
];

export interface MockFlightProviderOptions {
  active?: boolean;
}

const validDate = (value: string, field: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`${field} must be a valid date`);
  return date;
};

const withTime = (date: Date, hour: number): string => {
  const result = new Date(date);
  result.setUTCHours(hour, 0, 0, 0);
  return result.toISOString();
};

export class MockFlightProvider implements FlightDealProvider {
  readonly id = "mock";
  readonly name = "UR WAY Demo México";
  readonly isActive: boolean;

  constructor(options: MockFlightProviderOptions = {}) {
    this.isActive = options.active ?? true;
  }

  async fetchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]> {
    if (!this.isActive) return [];
    if (params.origins.length === 0) throw new RangeError("Se requiere al menos un origen");
    const departureStart = validDate(params.departureDateFrom, "departureDateFrom");
    const departureEnd = validDate(params.departureDateTo, "departureDateTo");
    if (departureEnd < departureStart) {
      throw new RangeError("departureDateTo no puede ser anterior a departureDateFrom");
    }
    const origins = params.origins.map((code) => getAirport(code));
    const destinationFilter = new Set(
      params.destinations?.map((code) => code.trim().toUpperCase()) ?? [],
    );
    const matchingTemplates = TEMPLATES.filter(
      ({ destination }) => destinationFilter.size === 0 || destinationFilter.has(destination),
    );
    const windowDays = Math.max(
      1,
      Math.floor((departureEnd.getTime() - departureStart.getTime()) / 86_400_000) + 1,
    );
    const currency = params.currency?.trim().toUpperCase() || "MXN";
    const deals = matchingTemplates.map((template, index): NormalizedFlightDeal => {
      const departure = new Date(
        departureStart.getTime() + (index % windowDays) * 86_400_000,
      );
      const returnDate = new Date(
        departure.getTime() + template.tripLengthDays * 86_400_000,
      );
      const origin = origins[index % origins.length];
      return {
        provider: this.id,
        providerDealId: `mock-${origin.code}-${template.destination}-${index + 1}`,
        origin,
        destination: getAirport(template.destination),
        departureDate: withTime(departure, template.departureHour),
        returnDate:
          params.tripType === TripType.ONE_WAY
            ? undefined
            : withTime(returnDate, Math.max(6, template.departureHour - 3)),
        tripType: params.tripType,
        price: template.price,
        originalPrice: template.originalPrice,
        currency,
        airline: template.airline,
        flightNumber: template.flightNumber,
        stops: template.stops,
        durationMinutes: template.durationMinutes,
        overnight: template.departureHour >= 20,
        cabinClass: params.cabinClass ?? "economy",
        bookingUrl: `https://www.google.com/travel/flights?q=${encodeURIComponent(`${origin.code} a ${template.destination}`)}`,
        imageUrl: template.imageUrl,
        expiresAt: new Date(Date.now() + 36 * 3_600_000).toISOString(),
        metadata: { market: "MX", source: "demo" },
      };
    });
    const priceFiltered = deals.filter(
      (deal) => params.maxPrice === undefined || deal.price <= params.maxPrice,
    );
    return priceFiltered.slice(0, params.limit ?? priceFiltered.length);
  }

  async searchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]> {
    return this.fetchDeals(params);
  }
}

export const mockFlightProvider = new MockFlightProvider();
