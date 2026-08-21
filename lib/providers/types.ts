import type {
  Airport,
  CurrencyCode,
  ISODateString,
  TripType,
} from "../domain/types";

export interface DealSearchParams {
  origins: readonly string[];
  destinations?: readonly string[];
  departureDateFrom: ISODateString;
  departureDateTo: ISODateString;
  returnDateFrom?: ISODateString;
  returnDateTo?: ISODateString;
  tripType: TripType;
  adults?: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
  currency?: CurrencyCode;
  maxPrice?: number;
  limit?: number;
}

export interface NormalizedFlightDeal {
  provider: string;
  providerDealId: string;
  origin: Airport;
  destination: Airport;
  departureDate: ISODateString;
  returnDate?: ISODateString;
  tripType: TripType;
  price: number;
  originalPrice?: number;
  currency: CurrencyCode;
  airline: string;
  flightNumber?: string;
  stops: number;
  durationMinutes: number;
  overnight?: boolean;
  cabinClass?: string;
  bookingUrl: string;
  imageUrl?: string;
  expiresAt?: ISODateString;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface FlightDealProvider {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  fetchDeals(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]>;
  searchDeals?(params: DealSearchParams): Promise<readonly NormalizedFlightDeal[]>;
}

export class ProviderConfigurationError extends Error {
  readonly providerId: string;

  constructor(providerId: string, message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
    this.providerId = providerId;
  }
}

export class ProviderRequestError extends Error {
  readonly providerId: string;
  readonly status?: number;

  constructor(providerId: string, message: string, status?: number) {
    super(message);
    this.name = "ProviderRequestError";
    this.providerId = providerId;
    this.status = status;
  }
}
