import {
  providerRegistry,
  type ProviderRegistry,
} from "../providers/registry";
import type {
  DealSearchParams,
  FlightDealProvider,
  NormalizedFlightDeal,
} from "../providers/types";
import { getDestinationImageUrl } from "../media/country-images";
import { createDealFingerprint, deduplicateDeals } from "./dedup";
import { calculateDealScore, type DealScoringConfig } from "./scoring";
import { DealStatus, DealType, TripType, type Deal } from "./types";

export interface DiscoveryFailure {
  providerId: string;
  message: string;
  cause: unknown;
}

export interface DiscoveryResult {
  deals: readonly Deal[];
  failures: readonly DiscoveryFailure[];
  providersQueried: number;
  rawDealCount: number;
  duplicateCount: number;
  reviewCount: number;
}

export interface DiscoverDealsOptions {
  providers?: readonly FlightDealProvider[];
  registry?: ProviderRegistry;
  scoring?: DealScoringConfig;
  minimumReviewScore?: number;
  allowPartialResults?: boolean;
  now?: Date;
}

export class DealDiscoveryError extends Error {
  readonly failures: readonly DiscoveryFailure[];

  constructor(failures: readonly DiscoveryFailure[]) {
    super(`Deal discovery failed for ${failures.length} provider(s)`);
    this.name = "DealDiscoveryError";
    this.failures = failures;
  }
}

const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const percentageSaved = (deal: NormalizedFlightDeal): number => {
  if (!deal.originalPrice || deal.originalPrice <= deal.price) return 0;
  return Math.round((((deal.originalPrice - deal.price) / deal.originalPrice) * 100) * 10) / 10;
};

const durationDaysFor = (deal: NormalizedFlightDeal): number => {
  if (!deal.returnDate) return 1;
  return Math.max(
    1,
    Math.round(
      (new Date(deal.returnDate).getTime() - new Date(deal.departureDate).getTime()) /
        86_400_000,
    ),
  );
};

const dealTypeFor = (
  deal: NormalizedFlightDeal,
  savingsPercentage: number,
  now: Date,
): DealType => {
  const departureLeadDays =
    (new Date(deal.departureDate).getTime() - now.getTime()) / 86_400_000;
  if (departureLeadDays >= 0 && departureLeadDays <= 7) return DealType.TODAY;
  if (savingsPercentage >= 45) return DealType.FLASH;
  if (durationDaysFor(deal) <= 4) return DealType.WEEKEND;
  if (["CUN", "SJO", "HAV"].includes(deal.destination.code)) return DealType.BEACH;
  if (deal.durationMinutes >= 600) return DealType.LONG_HAUL;
  return DealType.CITY;
};

const secureBookingUrl = (value: string): string => {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.toString();
  } catch {
    return "https://www.google.com/travel/flights";
  }
  return "https://www.google.com/travel/flights";
};

const validateNormalizedDeal = (deal: NormalizedFlightDeal): void => {
  if (!deal.provider.trim() || !deal.providerDealId.trim()) {
    throw new TypeError("Normalized deals require provider and providerDealId");
  }
  if (!Number.isFinite(deal.price) || deal.price < 0) {
    throw new RangeError("Normalized deal price must be a finite, non-negative number");
  }
  if (!Number.isInteger(deal.stops) || deal.stops < 0) {
    throw new RangeError("Normalized deal stops must be a non-negative integer");
  }
  if (!Number.isFinite(deal.durationMinutes) || deal.durationMinutes <= 0) {
    throw new RangeError("Normalized deal durationMinutes must be positive");
  }
};

const toDeal = (
  normalized: NormalizedFlightDeal,
  minimumReviewScore: number,
  scoring: DealScoringConfig,
  now: Date,
): Deal => {
  validateNormalizedDeal(normalized);
  const fingerprint = createDealFingerprint(normalized);
  const score = calculateDealScore(normalized, scoring);
  const timestamp = now.toISOString();
  const route = `${normalized.origin.city} a ${normalized.destination.city}`;
  const departureDay = new Date(normalized.departureDate).toISOString().slice(0, 10);
  const travelEndDate = normalized.returnDate ?? normalized.departureDate;
  const normalPrice = Math.max(normalized.price, normalized.originalPrice ?? normalized.price);
  const savings = Math.max(0, normalPrice - normalized.price);
  const savingsPercentage = percentageSaved(normalized);
  const durationDays = durationDaysFor(normalized);
  return {
    ...normalized,
    id: fingerprint,
    title: `${normalized.origin.code}–${normalized.destination.code} desde $${Math.round(normalized.price).toLocaleString("es-MX")} MXN`,
    slug: `${slugify(route)}-${departureDay}-${fingerprint.slice(-5)}`,
    description: `Vuelo ${normalized.tripType === TripType.ROUND_TRIP ? "redondo" : "sencillo"} de ${normalized.origin.city} a ${normalized.destination.city} con ${normalized.airline}. Tarifa detectada por UR WAY; disponibilidad y condiciones pueden cambiar.`,
    shortCopy: `${normalized.destination.city} desde $${Math.round(normalized.price).toLocaleString("es-MX")} MXN`,
    status: score.total >= minimumReviewScore ? DealStatus.REVIEW : DealStatus.DISCOVERED,
    dealType: dealTypeFor(normalized, savingsPercentage, now),
    normalPrice,
    savings,
    savingsPercentage,
    baggage: "Artículo personal incluido; confirma equipaje de mano y documentado antes de pagar.",
    durationDays,
    dateWindow: {
      start: normalized.departureDate,
      end: travelEndDate,
      flexible: false,
    },
    travelStartDate: normalized.departureDate,
    travelEndDate,
    bookingUrl: secureBookingUrl(normalized.bookingUrl),
    imageUrl:
      normalized.imageUrl ??
      getDestinationImageUrl(normalized.destination.city, normalized.destination.countryCode),
    fingerprint,
    score,
    tags: [
      normalized.stops === 0 ? "Directo" : `${normalized.stops} escala${normalized.stops === 1 ? "" : "s"}`,
      normalized.destination.country,
      "Tarifa verificada",
    ],
    featured: score.total >= 95,
    detectedAt: timestamp,
    verifiedAt: timestamp,
    discoveredAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export async function discoverDeals(
  params: DealSearchParams,
  options: DiscoverDealsOptions = {},
): Promise<DiscoveryResult> {
  const minimumReviewScore = options.minimumReviewScore ?? 72;
  if (!Number.isFinite(minimumReviewScore) || minimumReviewScore < 0 || minimumReviewScore > 100) {
    throw new RangeError("minimumReviewScore must be between 0 and 100");
  }
  const now = options.now ? new Date(options.now.getTime()) : new Date();
  if (Number.isNaN(now.getTime())) throw new TypeError("now must be a valid date");
  const selectedProviders = options.providers ?? (options.registry ?? providerRegistry).active();
  const activeProviders = selectedProviders.filter((provider) => provider.isActive);
  const settled = await Promise.allSettled(
    activeProviders.map(async (provider) => ({
      provider,
      deals: await provider.fetchDeals(params),
    })),
  );
  const failures: DiscoveryFailure[] = [];
  const rawDeals: NormalizedFlightDeal[] = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      rawDeals.push(...result.value.deals);
    } else {
      failures.push({
        providerId: activeProviders[index].id,
        message: result.reason instanceof Error ? result.reason.message : "Unknown provider error",
        cause: result.reason,
      });
    }
  });
  if (failures.length > 0 && options.allowPartialResults === false) {
    throw new DealDiscoveryError(failures);
  }
  const uniqueDeals = deduplicateDeals(rawDeals, {
    choose: (existing, duplicate) =>
      (duplicate.originalPrice ?? 0) > (existing.originalPrice ?? 0) ? duplicate : existing,
  });
  const scoring: DealScoringConfig = {
    ...options.scoring,
    date: { ...options.scoring?.date, now },
  };
  const deals = uniqueDeals
    .map((deal) => toDeal(deal, minimumReviewScore, scoring, now))
    .sort((left, right) => right.score.total - left.score.total);
  return {
    deals,
    failures,
    providersQueried: activeProviders.length,
    rawDealCount: rawDeals.length,
    duplicateCount: rawDeals.length - uniqueDeals.length,
    reviewCount: deals.filter((deal) => deal.status === DealStatus.REVIEW).length,
  };
}

export const discoverDealCandidates = discoverDeals;
