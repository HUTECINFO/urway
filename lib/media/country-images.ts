export const COUNTRY_IMAGE_BUCKET = "country-images";
export const CITY_IMAGE_FOLDER = "cities";

export const COUNTRY_IMAGE_CODES = [
  "AR", "BR", "CA", "CO", "CR", "CU", "ES",
  "FR", "IT", "JP", "MX", "PE", "US",
] as const;

export type CountryImageCode = (typeof COUNTRY_IMAGE_CODES)[number];

const fallbackCode: CountryImageCode = "MX";
const supportedCodes = new Set<string>(COUNTRY_IMAGE_CODES);

const CITY_IMAGE_SLUGS = new Set([
  "atlanta", "bangkok", "bogota", "buenos-aires", "cali", "cartagena", "chicago",
  "ciudad-de-panama", "denver", "dubai", "dublin", "estambul", "florianopolis",
  "la-habana", "las-vegas", "lima", "lisboa", "los-angeles", "lyon", "madrid",
  "medellin", "miami", "nueva-york", "orlando", "osaka", "palermo", "paris",
  "quito", "rio-de-janeiro", "roma", "san-francisco", "san-jose", "santiago",
  "sao-paulo", "singapur", "tokio", "toronto", "vancouver",
]);

export function getCountryImageUrl(countryCode?: string | null) {
  const normalizedCode = countryCode?.trim().toUpperCase() ?? fallbackCode;
  const code = supportedCodes.has(normalizedCode) ? normalizedCode : fallbackCode;
  const filename = `${code.toLowerCase()}.webp`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  return supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/${COUNTRY_IMAGE_BUCKET}/countries/${filename}`
    : `/media/countries/${filename}`;
}

export function slugifyCity(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCityImageUrl(city?: string | null): string | null {
  const slug = city ? slugifyCity(city) : "";
  if (!CITY_IMAGE_SLUGS.has(slug)) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  return supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/${COUNTRY_IMAGE_BUCKET}/${CITY_IMAGE_FOLDER}/${slug}.webp`
    : `/media/cities/${slug}.webp`;
}

export function getDestinationImageUrl(city: string | null | undefined, countryCode?: string | null): string {
  return getCityImageUrl(city) ?? getCountryImageUrl(countryCode);
}
