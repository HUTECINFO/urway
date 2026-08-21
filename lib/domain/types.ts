export enum DealStatus {
  DISCOVERED = "DISCOVERED",
  REVIEW = "REVIEW",
  APPROVED = "APPROVED",
  PUBLISHED = "PUBLISHED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED",
}

export enum DealType {
  TODAY = "TODAY",
  FLASH = "FLASH",
  WEEKEND = "WEEKEND",
  LONG_HAUL = "LONG_HAUL",
  BEACH = "BEACH",
  CITY = "CITY",
}

export enum TripType {
  ROUND_TRIP = "ROUND_TRIP",
  ONE_WAY = "ONE_WAY",
}

export enum ScoreLabel {
  NO_PUBLICAR = "No publicar",
  NORMAL = "Normal",
  BUEN_DROP = "Buen Drop",
  HOT_DROP = "Hot Drop",
  FLASH_DROP = "Flash Drop",
}

export type ISODateString = string;
export type CurrencyCode = string;

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ScoreBreakdown {
  price: number;
  savings: number;
  destination: number;
  date: number;
  flightQuality: number;
}

export interface DealScore {
  total: number;
  label: ScoreLabel;
  breakdown: ScoreBreakdown;
}

export type Score = DealScore;

export interface DealDateWindow {
  start: ISODateString;
  end: ISODateString;
  flexible: boolean;
}

export interface DealScoringInput {
  price: number;
  originalPrice?: number;
  destination: Airport;
  departureDate: ISODateString;
  returnDate?: ISODateString;
  stops: number;
  durationMinutes: number;
  airline?: string;
  overnight?: boolean;
}

export interface Deal extends DealScoringInput {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortCopy: string;
  status: DealStatus;
  dealType: DealType;
  tripType: TripType;
  origin: Airport;
  currency: CurrencyCode;
  normalPrice: number;
  savings: number;
  savingsPercentage: number;
  airline: string;
  flightNumber?: string;
  cabinClass?: string;
  baggage: string;
  durationDays: number;
  dateWindow: DealDateWindow;
  travelStartDate: ISODateString;
  travelEndDate: ISODateString;
  bookingUrl: string;
  imageUrl: string;
  provider: string;
  providerDealId: string;
  fingerprint: string;
  score: DealScore;
  tags: readonly string[];
  featured: boolean;
  detectedAt: ISODateString;
  verifiedAt: ISODateString;
  publishedAt?: ISODateString;
  discoveredAt: ISODateString;
  expiresAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
