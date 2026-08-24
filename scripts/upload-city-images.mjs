import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const bucket = "country-images";
const folder = "cities";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(root, "public", "media", folder);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const files = (await readdir(sourceDir)).filter((file) => file.endsWith(".webp")).sort();
if (files.length === 0) throw new Error("No hay imágenes de ciudades en public/media/cities.");

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
for (const file of files) {
  const objectPath = `${folder}/${file}`;
  const body = await readFile(join(sourceDir, file));
  const { error } = await client.storage.from(bucket).upload(objectPath, body, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw new Error(`${file}: ${error.message}`);
  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
  publicUrls.set(file.replace(/\.webp$/, ""), data.publicUrl);
}

const updateTable = async (table, cityField) => {
  const { data: rows, error } = await client.from(table).select(`id,${cityField}`);
  if (error) throw error;
  let updated = 0;
  for (const row of rows ?? []) {
    const slug = String(row[cityField] ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const imageUrl = publicUrls.get(slug);
    if (!imageUrl) continue;
    const { error: updateError } = await client.from(table)
      .update({ image_url: imageUrl })
      .eq("id", row.id);
    if (updateError) throw updateError;
    updated += 1;
  }
  return updated;
};

const dealsUpdated = await updateTable("deals", "destination_city");
const destinationsUpdated = await updateTable("destinations", "city");

console.log(JSON.stringify({
  bucket,
  folder,
  uploaded: files.length,
  files,
  dealsUpdated,
  destinationsUpdated,
}, null, 2));
