import {
  type Airport,
  type DealScore,
  type DealScoringInput,
  ScoreLabel,
  type ScoreBreakdown,
} from "./types";

export interface PriceScoreConfig {
  excellentPrice: number;
  poorPrice: number;
}

export interface SavingsScoreConfig {
  excellentSavingsPercentage: number;
  minimumSavingsPercentage: number;
}

export interface DestinationScoreConfig {
  defaultScore: number;
  destinationScores: Readonly<Record<string, number>>;
  preferredDestinationCodes: readonly string[];
  preferredDestinationBonus: number;
}

export interface DateScoreConfig {
  idealLeadTimeStartDays: number;
  idealLeadTimeEndDays: number;
  minimumLeadTimeDays: number;
  maximumLeadTimeDays: number;
  weekendBonus: number;
  now: Date;
}

export interface FlightQualityInput {
  stops: number;
  durationMinutes: number;
  overnight?: boolean;
}

export interface FlightQualityScoreConfig {
  nonstopScore: number;
  oneStopScore: number;
  additionalStopPenalty: number;
  idealDurationMinutes: number;
  longDurationMinutes: number;
  longDurationPenalty: number;
  overnightPenalty: number;
}

export interface ScoringWeights {
  price: number;
  savings: number;
  destination: number;
  date: number;
  flightQuality: number;
}

export interface DealScoringConfig {
  price?: Partial<PriceScoreConfig>;
  savings?: Partial<SavingsScoreConfig>;
  destination?: Partial<DestinationScoreConfig>;
  date?: Partial<Omit<DateScoreConfig, "now">> & { now?: Date };
  flightQuality?: Partial<FlightQualityScoreConfig>;
  weights?: Partial<ScoringWeights>;
}

export interface ScoringModules {
  price: typeof calculatePriceScore;
  savings: typeof calculateSavingsScore;
  destination: typeof calculateDestinationScore;
  date: typeof calculateDateScore;
  flightQuality: typeof calculateFlightQualityScore;
}

const DEFAULT_DESTINATION_SCORES: Readonly<Record<string, number>> = {
  BOG: 86,
  CDG: 92,
  CUN: 91,
  EZE: 90,
  FCO: 91,
  HAV: 88,
  JFK: 91,
  LAS: 87,
  LAX: 89,
  LIM: 88,
  MAD: 93,
  NRT: 95,
  SJO: 89,
  YVR: 92,
};

export const DEFAULT_SCORING_WEIGHTS: Readonly<ScoringWeights> = {
  price: 0.4,
  savings: 0.25,
  destination: 0.15,
  date: 0.1,
  flightQuality: 0.1,
};

const clampScore = (value: number): number =>
  Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;

const assertFiniteNonNegative = (value: number, field: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} must be a finite, non-negative number`);
  }
};

export function calculatePriceScore(
  price: number,
  config: Partial<PriceScoreConfig> = {},
): number {
  assertFiniteNonNegative(price, "price");
  const excellentPrice = config.excellentPrice ?? 4_500;
  const poorPrice = config.poorPrice ?? 24_000;
  if (excellentPrice < 0 || poorPrice <= excellentPrice) {
    throw new RangeError("poorPrice must be greater than a non-negative excellentPrice");
  }
  if (price <= excellentPrice) return 100;
  if (price >= poorPrice) return 0;
  return clampScore(100 * (1 - (price - excellentPrice) / (poorPrice - excellentPrice)));
}

export function calculateSavingsScore(
  savingsPercentage: number,
  config: Partial<SavingsScoreConfig> = {},
): number {
  assertFiniteNonNegative(savingsPercentage, "savingsPercentage");
  const excellent = config.excellentSavingsPercentage ?? 50;
  const minimum = config.minimumSavingsPercentage ?? 10;
  if (minimum < 0 || excellent <= minimum) {
    throw new RangeError(
      "excellentSavingsPercentage must be greater than minimumSavingsPercentage",
    );
  }
  if (savingsPercentage <= minimum) return 0;
  if (savingsPercentage >= excellent) return 100;
  return clampScore((100 * (savingsPercentage - minimum)) / (excellent - minimum));
}

export function calculateDestinationScore(
  destination: Airport | string,
  config: Partial<DestinationScoreConfig> = {},
): number {
  const code = (typeof destination === "string" ? destination : destination.code)
    .trim()
    .toUpperCase();
  if (!code) throw new TypeError("destination code is required");
  const scores = config.destinationScores ?? DEFAULT_DESTINATION_SCORES;
  const baseScore = scores[code] ?? config.defaultScore ?? 65;
  const preferredCodes = config.preferredDestinationCodes ?? [];
  const preferredBonus = config.preferredDestinationBonus ?? 8;
  if (!Number.isFinite(baseScore) || !Number.isFinite(preferredBonus)) {
    throw new TypeError("destination scores and bonus must be finite numbers");
  }
  const isPreferred = preferredCodes.some(
    (preferredCode) => preferredCode.trim().toUpperCase() === code,
  );
  return clampScore(baseScore + (isPreferred ? preferredBonus : 0));
}

const parseDate = (value: string | Date, field: string): Date => {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`${field} must be a valid date`);
  return date;
};

export function calculateDateScore(
  departureDate: string | Date,
  config: Partial<Omit<DateScoreConfig, "now">> & { now?: Date } = {},
): number {
  const departure = parseDate(departureDate, "departureDate");
  const now = parseDate(config.now ?? new Date(), "now");
  const idealStart = config.idealLeadTimeStartDays ?? 21;
  const idealEnd = config.idealLeadTimeEndDays ?? 120;
  const minimum = config.minimumLeadTimeDays ?? 2;
  const maximum = config.maximumLeadTimeDays ?? 365;
  const weekendBonus = config.weekendBonus ?? 5;
  if (!(minimum >= 0 && minimum < idealStart && idealStart <= idealEnd && idealEnd < maximum)) {
    throw new RangeError("date score lead-time boundaries must be in ascending order");
  }
  const leadDays = (departure.getTime() - now.getTime()) / 86_400_000;
  let score: number;
  if (leadDays < minimum || leadDays > maximum) {
    score = 0;
  } else if (leadDays < idealStart) {
    score = (85 * (leadDays - minimum)) / (idealStart - minimum);
  } else if (leadDays <= idealEnd) {
    score = 95;
  } else {
    score = 95 * (1 - (leadDays - idealEnd) / (maximum - idealEnd));
  }
  const day = departure.getUTCDay();
  return clampScore(score + (day === 5 || day === 6 ? weekendBonus : 0));
}

export function calculateFlightQualityScore(
  flight: FlightQualityInput,
  config: Partial<FlightQualityScoreConfig> = {},
): number {
  assertFiniteNonNegative(flight.stops, "stops");
  assertFiniteNonNegative(flight.durationMinutes, "durationMinutes");
  if (!Number.isInteger(flight.stops)) throw new TypeError("stops must be an integer");
  const nonstopScore = config.nonstopScore ?? 100;
  const oneStopScore = config.oneStopScore ?? 78;
  const additionalStopPenalty = config.additionalStopPenalty ?? 24;
  const idealDuration = config.idealDurationMinutes ?? 360;
  const longDuration = config.longDurationMinutes ?? 900;
  const longDurationPenalty = config.longDurationPenalty ?? 25;
  const overnightPenalty = config.overnightPenalty ?? 8;
  if (idealDuration < 0 || longDuration <= idealDuration) {
    throw new RangeError("longDurationMinutes must exceed idealDurationMinutes");
  }
  const stopScore =
    flight.stops === 0
      ? nonstopScore
      : oneStopScore - Math.max(0, flight.stops - 1) * additionalStopPenalty;
  const durationPenalty =
    flight.durationMinutes <= idealDuration
      ? 0
      : Math.min(
          longDurationPenalty,
          (longDurationPenalty * (flight.durationMinutes - idealDuration)) /
            (longDuration - idealDuration),
        );
  return clampScore(stopScore - durationPenalty - (flight.overnight ? overnightPenalty : 0));
}

export function getScoreLabel(score: number): ScoreLabel {
  assertFiniteNonNegative(score, "score");
  if (score > 100) throw new RangeError("score cannot exceed 100");
  if (score >= 95) return ScoreLabel.FLASH_DROP;
  if (score >= 85) return ScoreLabel.HOT_DROP;
  if (score >= 75) return ScoreLabel.BUEN_DROP;
  if (score >= 60) return ScoreLabel.NORMAL;
  return ScoreLabel.NO_PUBLICAR;
}

export const calculateScoreLabel = getScoreLabel;

const savingsPercentageFor = (deal: DealScoringInput): number => {
  if (deal.originalPrice === undefined || deal.originalPrice <= 0) return 0;
  return Math.max(0, ((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
};

export function calculateDealScore(
  deal: DealScoringInput,
  config: DealScoringConfig = {},
  moduleOverrides: Partial<ScoringModules> = {},
): DealScore {
  const modules: ScoringModules = {
    price: moduleOverrides.price ?? calculatePriceScore,
    savings: moduleOverrides.savings ?? calculateSavingsScore,
    destination: moduleOverrides.destination ?? calculateDestinationScore,
    date: moduleOverrides.date ?? calculateDateScore,
    flightQuality: moduleOverrides.flightQuality ?? calculateFlightQualityScore,
  };
  const breakdown: ScoreBreakdown = {
    price: modules.price(deal.price, config.price),
    savings: modules.savings(savingsPercentageFor(deal), config.savings),
    destination: modules.destination(deal.destination, config.destination),
    date: modules.date(deal.departureDate, config.date),
    flightQuality: modules.flightQuality(
      {
        stops: deal.stops,
        durationMinutes: deal.durationMinutes,
        overnight: deal.overnight,
      },
      config.flightQuality,
    ),
  };
  const weights: ScoringWeights = { ...DEFAULT_SCORING_WEIGHTS, ...config.weights };
  const entries = Object.entries(weights) as Array<[keyof ScoreBreakdown, number]>;
  if (entries.some(([, weight]) => !Number.isFinite(weight) || weight < 0)) {
    throw new RangeError("scoring weights must be finite, non-negative numbers");
  }
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) throw new RangeError("at least one scoring weight must be positive");
  const total = clampScore(
    entries.reduce((sum, [key, weight]) => sum + breakdown[key] * weight, 0) /
      totalWeight,
  );
  return { total, label: getScoreLabel(total), breakdown };
}
