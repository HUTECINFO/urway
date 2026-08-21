import type { NormalizedFlightDeal } from "../providers/types";

export type FingerprintableDeal = Pick<
  NormalizedFlightDeal,
  | "origin"
  | "destination"
  | "departureDate"
  | "returnDate"
  | "tripType"
  | "airline"
  | "price"
  | "currency"
>;

const normalizedDate = (value: string | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`Invalid deal date: ${value}`);
  return date.toISOString().slice(0, 10);
};

const hash = (value: string): string => {
  let result = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193);
  }
  return (result >>> 0).toString(36).padStart(7, "0");
};

export function createDealFingerprint(deal: FingerprintableDeal): string {
  if (!Number.isFinite(deal.price) || deal.price < 0) {
    throw new RangeError("Deal price must be a finite, non-negative number");
  }
  const identity = [
    deal.origin.code,
    deal.destination.code,
    normalizedDate(deal.departureDate),
    normalizedDate(deal.returnDate),
    deal.tripType,
    deal.airline,
    Math.round(deal.price),
    deal.currency,
  ]
    .map((part) => String(part).trim().toUpperCase().replace(/\s+/g, " "))
    .join("|");
  return `deal_${hash(identity)}${hash(`urway:${identity}`)}`;
}

export const fingerprintDeal = createDealFingerprint;

export interface DeduplicateDealsOptions<T extends FingerprintableDeal> {
  fingerprint?: (deal: T) => string;
  choose?: (existing: T, duplicate: T) => T;
}

export function deduplicateDeals<T extends FingerprintableDeal>(
  deals: readonly T[],
  options: DeduplicateDealsOptions<T> = {},
): T[] {
  const fingerprint = options.fingerprint ?? createDealFingerprint;
  const unique = new Map<string, T>();
  for (const deal of deals) {
    const key = fingerprint(deal);
    const existing = unique.get(key);
    if (!existing) {
      unique.set(key, deal);
    } else if (options.choose) {
      unique.set(key, options.choose(existing, deal));
    }
  }
  return [...unique.values()];
}

export const deduplicateFlightDeals = deduplicateDeals;
