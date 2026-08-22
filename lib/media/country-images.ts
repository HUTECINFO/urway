export const COUNTRY_IMAGE_BUCKET = "country-images";

export const COUNTRY_IMAGE_CODES = [
  "AR", "BR", "CA", "CO", "CR", "CU", "ES",
  "FR", "IT", "JP", "MX", "PE", "US",
] as const;

export type CountryImageCode = (typeof COUNTRY_IMAGE_CODES)[number];

const fallbackCode: CountryImageCode = "MX";
const supportedCodes = new Set<string>(COUNTRY_IMAGE_CODES);

export function getCountryImageUrl(countryCode?: string | null) {
  const normalizedCode = countryCode?.trim().toUpperCase() ?? fallbackCode;
  const code = supportedCodes.has(normalizedCode) ? normalizedCode : fallbackCode;
  const filename = `${code.toLowerCase()}.webp`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  return supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/${COUNTRY_IMAGE_BUCKET}/countries/${filename}`
    : `/media/countries/${filename}`;
}
