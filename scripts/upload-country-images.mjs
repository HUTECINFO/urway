import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const bucket = "country-images";
const countryCodes = ["AR", "BR", "CA", "CO", "CR", "CU", "ES", "FR", "IT", "JP", "MX", "PE", "US"];
const airportCountryCodes = {
  AR: ["EZE"], BR: ["GRU"], CA: ["YVR"], CO: ["BOG"], CR: ["SJO"],
  CU: ["HAV"], ES: ["MAD"], FR: ["CDG"], IT: ["FCO"], JP: ["NRT"],
  MX: ["MEX", "NLU", "GDL", "MTY", "BJX", "QRO", "TIJ", "CUN"],
  PE: ["LIM"], US: ["JFK", "LAX", "LAS"],
};
const countryNameCodes = new Map([
  ["argentina", "AR"], ["brasil", "BR"], ["canada", "CA"],
  ["colombia", "CO"], ["costa rica", "CR"], ["cuba", "CU"],
  ["espana", "ES"], ["estados unidos", "US"], ["francia", "FR"],
  ["italia", "IT"], ["japon", "JP"], ["mexico", "MX"], ["peru", "PE"],
]);
const codeByAirport = new Map(
  Object.entries(airportCountryCodes).flatMap(([countryCode, airports]) =>
    airports.map((airport) => [airport, countryCode]),
  ),
);
const normalize = (value) => value.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: buckets, error: bucketsError } = await client.storage.listBuckets();
if (bucketsError) throw bucketsError;

const bucketOptions = {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/webp"],
};
const { error: bucketError } = buckets.some(({ id }) => id === bucket)
  ? await client.storage.updateBucket(bucket, bucketOptions)
  : await client.storage.createBucket(bucket, bucketOptions);
if (bucketError) throw bucketError;

const publicUrls = new Map();
for (const countryCode of countryCodes) {
  const filename = `${countryCode.toLowerCase()}.webp`;
  const objectPath = `countries/${filename}`;
  const body = await readFile(join(root, "public", "media", "countries", filename));
  const { error } = await client.storage.from(bucket).upload(objectPath, body, {
    cacheControl: "31536000", contentType: "image/webp", upsert: true,
  });
  if (error) throw new Error(`${countryCode}: ${error.message}`);
  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
  publicUrls.set(countryCode, data.publicUrl);
}

const cityFiles = (await readdir(join(root, "public", "media", "cities")))
  .filter((file) => file.endsWith(".webp"));
const cityPublicUrls = new Map(cityFiles.map((file) => {
  const slug = file.replace(/\.webp$/, "");
  const objectPath = `cities/${file}`;
  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
  return [slug, data.publicUrl];
}));

const citySlug = (value) => normalize(value)
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const countryCodeFor = (airportCode, countryName) =>
  codeByAirport.get(airportCode?.toUpperCase()) ??
  countryNameCodes.get(normalize(countryName ?? ""));

const updateRows = async (table, selection, airportField, countryField, cityField) => {
  const { data: rows, error } = await client.from(table).select(selection);
  if (error) throw error;
  let updated = 0;
  for (const row of rows ?? []) {
    const imageUrl = (cityField && cityPublicUrls.get(citySlug(row[cityField])))
      ?? publicUrls.get(countryCodeFor(row[airportField], row[countryField]));
    if (!imageUrl) continue;
    const { error: updateError } = await client.from(table)
      .update({ image_url: imageUrl }).eq("id", row.id);
    if (updateError) throw updateError;
    updated += 1;
  }
  return updated;
};

const dealsUpdated = await updateRows(
  "deals", "id,destination_airport_code,destination_country,destination_city",
  "destination_airport_code", "destination_country", "destination_city",
);
const destinationsUpdated = await updateRows(
  "destinations", "id,airport_code,country,city", "airport_code", "country", "city",
);
const { data: storedObjects, error: listError } = await client.storage
  .from(bucket).list("countries", { limit: 100, sortBy: { column: "name", order: "asc" } });
if (listError) throw listError;

console.log(JSON.stringify({
  bucket,
  files: storedObjects?.map(({ name }) => name) ?? [],
  dealsUpdated,
  destinationsUpdated,
}, null, 2));
