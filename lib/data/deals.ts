import "server-only";

import { getAirport } from "@/lib/demo/airports";
import { DealStatus, DealType, TripType, type Airport, type Deal } from "@/lib/domain/types";
import { getScoreLabel } from "@/lib/domain/scoring";
import { getCountryImageUrl } from "@/lib/media/country-images";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getDemoStore, type TrackedClick } from "./demo-store";
import { sanitizeExternalUrl } from "./url";

interface DbAirportRow {
  iata: string;
  name: string;
  city: string;
  country: string;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

interface DbDealRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_copy: string | null;
  destination_airport_code: string;
  destination_city: string;
  destination_country: string;
  provider: string;
  provider_reference: string | null;
  external_url: string;
  price: number;
  currency: string;
  normal_price: number;
  savings_percentage: number;
  trip_type: TripType;
  departure_date_start: string;
  departure_date_end: string;
  return_date_start: string | null;
  return_date_end: string | null;
  duration_days: number | null;
  duration_minutes: number | null;
  stops: number;
  airline: string | null;
  baggage: string | null;
  image_url: string | null;
  deal_type: DealType;
  score: number;
  price_score: number;
  savings_score: number;
  destination_score: number;
  date_score: number;
  flight_quality_score: number;
  status: DealStatus;
  detected_at: string;
  verified_at: string;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  fingerprint: string;
  origin: DbAirportRow | DbAirportRow[];
}

export interface DealEditorPatch {
  title?: string;
  description?: string;
  shortCopy?: string;
  slug?: string;
  dealType?: DealType;
  price?: number;
  normalPrice?: number;
  savingsPercentage?: number;
  departureDate?: string;
  returnDate?: string;
  imageUrl?: string;
  bookingUrl?: string;
}

export interface ClickInput {
  dealId: string;
  sessionId: string;
  source?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export interface AdminAnalytics {
  detectedToday: number;
  inReview: number;
  published: number;
  flashDrops: number;
  views: number;
  clicks: number;
  ctr: number;
  topDestinations: Array<{ label: string; value: number }>;
  topAirports: Array<{ label: string; value: number }>;
  topDeals: Array<{ id: string; title: string; clicks: number }>;
  affiliateRevenue: number;
  bookings: number;
  conversionRate: number;
}

function fallbackAirport(code: string, city: string, country: string): Airport {
  try {
    return getAirport(code);
  } catch {
    return {
      code,
      city,
      country,
      name: `${code} Airport`,
      countryCode: "XX",
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
    };
  }
}

function mapDbDeal(row: DbDealRow): Deal {
  const originRow = Array.isArray(row.origin) ? row.origin[0] : row.origin;
  const origin = originRow
    ? {
        code: originRow.iata,
        name: originRow.name,
        city: originRow.city,
        country: originRow.country,
        countryCode: originRow.country_code ?? "MX",
        latitude: originRow.latitude ?? 0,
        longitude: originRow.longitude ?? 0,
        timezone: originRow.timezone ?? "America/Mexico_City",
      }
    : fallbackAirport("MEX", "Ciudad de México", "México");
  const destination = fallbackAirport(
    row.destination_airport_code,
    row.destination_city,
    row.destination_country,
  );
  const normalPrice = Number(row.normal_price);
  const price = Number(row.price);
  const returnDate = row.return_date_start ?? undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? row.short_copy ?? row.title,
    shortCopy: row.short_copy ?? row.title,
    origin,
    destination,
    provider: row.provider,
    providerDealId: row.provider_reference ?? row.id,
    bookingUrl: row.external_url,
    price,
    originalPrice: normalPrice,
    normalPrice,
    savings: Math.max(0, normalPrice - price),
    currency: row.currency,
    savingsPercentage: Number(row.savings_percentage),
    tripType: row.trip_type,
    departureDate: row.departure_date_start,
    returnDate,
    travelStartDate: row.departure_date_start,
    travelEndDate: returnDate ?? row.departure_date_end,
    dateWindow: {
      start: row.departure_date_start,
      end: row.departure_date_end,
      flexible: row.departure_date_start !== row.departure_date_end,
    },
    durationDays: row.duration_days ?? 0,
    durationMinutes: row.duration_minutes ?? 0,
    stops: row.stops,
    airline: row.airline ?? "Por confirmar",
    baggage: row.baggage ?? "Consulta las condiciones del proveedor.",
    imageUrl: row.image_url ?? getCountryImageUrl(destination.countryCode),
    dealType: row.deal_type,
    status: row.status,
    score: {
      total: Number(row.score),
      label: getScoreLabel(Number(row.score)),
      breakdown: {
        price: Number(row.price_score),
        savings: Number(row.savings_score),
        destination: Number(row.destination_score),
        date: Number(row.date_score),
        flightQuality: Number(row.flight_quality_score),
      },
    },
    flightNumber: undefined,
    cabinClass: "ECONOMY",
    overnight: false,
    fingerprint: row.fingerprint,
    tags: [row.destination_country, row.stops === 0 ? "Vuelo directo" : `${row.stops} escala`],
    featured: row.score >= 85,
    detectedAt: row.detected_at,
    verifiedAt: row.verified_at,
    publishedAt: row.published_at ?? undefined,
    discoveredAt: row.detected_at,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function dbClient(admin = false) {
  if (!isSupabaseConfigured()) return null;
  return admin ? createAdminClient() ?? createClient() : createClient();
}

const dealSelection = "*, origin:airports!inner(*)";

export async function listPublishedDeals(originCode?: string): Promise<Deal[]> {
  const client = await dbClient();
  if (!client) {
    return [...getDemoStore().deals.values()]
      .filter((deal) => deal.status === DealStatus.PUBLISHED && deal.provider !== "mock" && (!originCode || deal.origin.code === originCode))
      .sort((left, right) => right.score.total - left.score.total);
  }

  let query = client
    .from("deals")
    .select(dealSelection)
    .eq("status", DealStatus.PUBLISHED)
    .neq("provider", "mock");
  if (originCode) query = query.eq("origin.iata", originCode);
  const { data, error } = await query.order("published_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los Drops: ${error.message}`);
  return ((data ?? []) as unknown as DbDealRow[]).map(mapDbDeal);
}

export async function listAdminDeals(): Promise<Deal[]> {
  const client = await dbClient(true);
  if (!client) return [...getDemoStore().deals.values()].sort((a, b) => b.score.total - a.score.total);

  const { data, error } = await client.from("deals").select(dealSelection).order("updated_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los candidatos: ${error.message}`);
  return ((data ?? []) as unknown as DbDealRow[]).map(mapDbDeal);
}

export async function getDealBySlug(slug: string, includeUnpublished = false): Promise<Deal | null> {
  const client = await dbClient(includeUnpublished);
  if (!client) {
    return [...getDemoStore().deals.values()].find(
      (deal) => deal.slug === slug && (includeUnpublished || (deal.status === DealStatus.PUBLISHED && deal.provider !== "mock")),
    ) ?? null;
  }

  let query = client.from("deals").select(dealSelection).eq("slug", slug);
  if (!includeUnpublished) query = query.eq("status", DealStatus.PUBLISHED).neq("provider", "mock");
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`No se pudo cargar el Drop: ${error.message}`);
  return data ? mapDbDeal(data as unknown as DbDealRow) : null;
}

export async function getDealById(id: string, includeUnpublished = false): Promise<Deal | null> {
  const client = await dbClient(includeUnpublished);
  if (!client) {
    const deal = getDemoStore().deals.get(id);
    return deal && (includeUnpublished || (deal.status === DealStatus.PUBLISHED && deal.provider !== "mock")) ? deal : null;
  }

  let query = client.from("deals").select(dealSelection).eq("id", id);
  if (!includeUnpublished) query = query.eq("status", DealStatus.PUBLISHED).neq("provider", "mock");
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`No se pudo cargar el Drop: ${error.message}`);
  return data ? mapDbDeal(data as unknown as DbDealRow) : null;
}

export async function updateDeal(id: string, patch: DealEditorPatch): Promise<Deal> {
  const client = await dbClient(true);
  if (!client) {
    const current = getDemoStore().deals.get(id);
    if (!current) throw new Error("Drop no encontrado");
    const updated: Deal = {
      ...current,
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.shortCopy !== undefined && { shortCopy: patch.shortCopy }),
      ...(patch.slug !== undefined && { slug: patch.slug }),
      ...(patch.dealType !== undefined && { dealType: patch.dealType }),
      ...(patch.price !== undefined && { price: patch.price }),
      ...(patch.normalPrice !== undefined && { normalPrice: patch.normalPrice, originalPrice: patch.normalPrice }),
      ...(patch.savingsPercentage !== undefined && { savingsPercentage: patch.savingsPercentage }),
      ...(patch.departureDate !== undefined && { departureDate: patch.departureDate, travelStartDate: patch.departureDate }),
      ...(patch.returnDate !== undefined && { returnDate: patch.returnDate, travelEndDate: patch.returnDate }),
      ...(patch.imageUrl !== undefined && { imageUrl: patch.imageUrl }),
      ...(patch.bookingUrl !== undefined && { bookingUrl: sanitizeExternalUrl(patch.bookingUrl).toString() }),
      updatedAt: new Date().toISOString(),
    };
    getDemoStore().deals.set(id, updated);
    return updated;
  }

  const dbPatch: Record<string, string | number> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.shortCopy !== undefined) dbPatch.short_copy = patch.shortCopy;
  if (patch.slug !== undefined) dbPatch.slug = patch.slug;
  if (patch.dealType !== undefined) dbPatch.deal_type = patch.dealType;
  if (patch.price !== undefined) dbPatch.price = patch.price;
  if (patch.normalPrice !== undefined) dbPatch.normal_price = patch.normalPrice;
  if (patch.savingsPercentage !== undefined) dbPatch.savings_percentage = patch.savingsPercentage;
  if (patch.departureDate !== undefined) dbPatch.departure_date_start = patch.departureDate;
  if (patch.returnDate !== undefined) dbPatch.return_date_start = patch.returnDate;
  if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;
  if (patch.bookingUrl !== undefined) dbPatch.external_url = sanitizeExternalUrl(patch.bookingUrl).toString();
  const { data, error } = await client.from("deals").update(dbPatch).eq("id", id).select(dealSelection).single();
  if (error) throw new Error(`No se pudo guardar el Drop: ${error.message}`);
  return mapDbDeal(data as unknown as DbDealRow);
}

const allowedTransitions: Record<DealStatus, readonly DealStatus[]> = {
  [DealStatus.DISCOVERED]: [DealStatus.REVIEW],
  [DealStatus.REVIEW]: [DealStatus.APPROVED, DealStatus.REJECTED],
  [DealStatus.APPROVED]: [DealStatus.PUBLISHED, DealStatus.REJECTED],
  [DealStatus.PUBLISHED]: [DealStatus.EXPIRED],
  [DealStatus.EXPIRED]: [],
  [DealStatus.REJECTED]: [],
};

export async function transitionDeal(
  id: string,
  nextStatus: DealStatus,
  rejectionReason?: string,
): Promise<Deal> {
  const current = await getDealById(id, true);
  if (!current) throw new Error("Drop no encontrado");
  if (!allowedTransitions[current.status].includes(nextStatus)) {
    throw new Error(`Transición no permitida: ${current.status} → ${nextStatus}`);
  }
  if (nextStatus === DealStatus.REJECTED && !rejectionReason?.trim()) {
    throw new Error("Indica el motivo del rechazo.");
  }

  const now = new Date().toISOString();
  const client = await dbClient(true);
  if (!client) {
    const updated: Deal = {
      ...current,
      status: nextStatus,
      verifiedAt: now,
      updatedAt: now,
      publishedAt: nextStatus === DealStatus.PUBLISHED ? now : current.publishedAt,
      expiresAt: nextStatus === DealStatus.EXPIRED ? now : current.expiresAt,
    };
    getDemoStore().deals.set(id, updated);
    return updated;
  }

  const patch: Record<string, string> = { status: nextStatus, verified_at: now };
  if (nextStatus === DealStatus.PUBLISHED) patch.published_at = now;
  if (nextStatus === DealStatus.EXPIRED) patch.expires_at = now;
  if (nextStatus === DealStatus.REJECTED) patch.rejection_reason = rejectionReason!.trim();
  const { data, error } = await client.from("deals").update(patch).eq("id", id).select(dealSelection).single();
  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);
  return mapDbDeal(data as unknown as DbDealRow);
}

export async function reverifyDeal(id: string): Promise<Deal> {
  const current = await getDealById(id, true);
  if (!current) throw new Error("Drop no encontrado");
  const verifiedAt = new Date().toISOString();
  const client = await dbClient(true);
  if (!client) {
    const updated = { ...current, verifiedAt, updatedAt: verifiedAt };
    getDemoStore().deals.set(id, updated);
    return updated;
  }
  const { data, error } = await client.from("deals").update({ verified_at: verifiedAt }).eq("id", id).select(dealSelection).single();
  if (error) throw new Error(`No se pudo verificar el Drop: ${error.message}`);
  return mapDbDeal(data as unknown as DbDealRow);
}

export async function recordDealView(dealId: string, sessionId: string) {
  const client = await dbClient(false);
  if (!client) {
    getDemoStore().views.push({ dealId, viewedAt: new Date().toISOString() });
    return;
  }
  await client.from("deal_views").insert({ deal_id: dealId, session_id: sessionId });
}

export async function recordDealClick(input: ClickInput) {
  const deal = await getDealById(input.dealId);
  if (!deal) throw new Error("Drop no encontrado o no publicado");
  const destination = sanitizeExternalUrl(deal.bookingUrl);
  const client = await dbClient(false);
  const clickedAt = new Date().toISOString();
  if (!client) {
    const click: TrackedClick = { ...input, source: input.source ?? null, referrer: input.referrer ?? null, utmSource: input.utmSource ?? null, utmMedium: input.utmMedium ?? null, utmCampaign: input.utmCampaign ?? null, clickedAt };
    getDemoStore().clicks.push(click);
  } else {
    const { error } = await client.from("deal_clicks").insert({
      deal_id: input.dealId,
      session_id: input.sessionId,
      referrer: input.referrer,
      source: input.source,
      utm_source: input.utmSource,
      utm_medium: input.utmMedium,
      utm_campaign: input.utmCampaign,
      clicked_at: clickedAt,
    });
    if (error) throw new Error(`No se pudo registrar el clic: ${error.message}`);
  }
  return destination;
}

export async function subscribeToNewsletter(email: string, source: string) {
  const normalized = email.trim().toLowerCase();
  const client = await dbClient();
  if (!client) {
    getDemoStore().subscribers.set(normalized, { email: normalized, source, createdAt: new Date().toISOString() });
    return;
  }
  const { error } = await client.from("newsletter_subscribers").insert({ email: normalized, source });
  if (error && error.code !== "23505") {
    throw new Error(`No se pudo completar la suscripción: ${error.message}`);
  }
}

function topCounts(labels: string[]) {
  const counts = new Map<string, number>();
  labels.forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const deals = await listAdminDeals();
  const client = await dbClient(true);
  let views = 0;
  let clicks = 0;
  let clickDealIds: string[] = [];
  if (!client) {
    views = getDemoStore().views.length;
    clicks = getDemoStore().clicks.length;
    clickDealIds = getDemoStore().clicks.map((click) => click.dealId);
  } else {
    const [{ count: viewCount }, { data: clickRows, count: clickCount }] = await Promise.all([
      client.from("deal_views").select("id", { count: "exact", head: true }),
      client.from("deal_clicks").select("deal_id", { count: "exact" }),
    ]);
    views = viewCount ?? 0;
    clicks = clickCount ?? 0;
    clickDealIds = (clickRows ?? []).map((row) => row.deal_id as string);
  }
  const byId = new Map(deals.map((deal) => [deal.id, deal]));
  const clickedDeals = clickDealIds.map((id) => byId.get(id)).filter((deal): deal is Deal => Boolean(deal));
  const perDeal = topCounts(clickDealIds).map(({ label, value }) => ({ id: label, title: byId.get(label)?.title ?? "Drop", clicks: value }));
  const today = new Date().toISOString().slice(0, 10);

  return {
    detectedToday: deals.filter((deal) => deal.detectedAt.startsWith(today)).length,
    inReview: deals.filter((deal) => deal.status === DealStatus.REVIEW).length,
    published: deals.filter((deal) => deal.status === DealStatus.PUBLISHED).length,
    flashDrops: deals.filter((deal) => deal.dealType === DealType.FLASH && deal.status === DealStatus.PUBLISHED).length,
    views,
    clicks,
    ctr: views > 0 ? Math.round((clicks / views) * 10_000) / 100 : 0,
    topDestinations: topCounts(clickedDeals.map((deal) => deal.destination.city)),
    topAirports: topCounts(clickedDeals.map((deal) => deal.origin.code)),
    topDeals: perDeal,
    affiliateRevenue: 0,
    bookings: 0,
    conversionRate: 0,
  };
}

export async function saveDiscoveredDeals(deals: readonly Deal[]) {
  const client = await dbClient(true);
  if (!client) {
    let inserted = 0;
    const store = getDemoStore();
    for (const deal of deals) {
      if ([...store.deals.values()].some((current) => current.fingerprint === deal.fingerprint)) continue;
      store.deals.set(deal.id, structuredClone(deal));
      inserted += 1;
    }
    return inserted;
  }

  const rows = deals.map((deal) => ({
    slug: deal.slug,
    title: deal.title,
    description: deal.description,
    short_copy: deal.shortCopy,
    destination_airport_code: deal.destination.code,
    destination_city: deal.destination.city,
    destination_country: deal.destination.country,
    provider: deal.provider,
    provider_reference: deal.providerDealId,
    external_url: sanitizeExternalUrl(deal.bookingUrl).toString(),
    price: deal.price,
    currency: deal.currency,
    normal_price: deal.normalPrice,
    savings_percentage: deal.savingsPercentage,
    trip_type: deal.tripType,
    departure_date_start: deal.dateWindow.start.slice(0, 10),
    departure_date_end: deal.dateWindow.end.slice(0, 10),
    return_date_start: deal.returnDate?.slice(0, 10) ?? null,
    return_date_end: deal.returnDate?.slice(0, 10) ?? null,
    duration_days: deal.tripType === TripType.ROUND_TRIP ? deal.durationDays : null,
    duration_minutes: deal.durationMinutes,
    stops: deal.stops,
    airline: deal.airline,
    baggage: deal.baggage,
    image_url: deal.imageUrl,
    deal_type: deal.dealType,
    score: deal.score.total,
    price_score: deal.score.breakdown.price,
    savings_score: deal.score.breakdown.savings,
    destination_score: deal.score.breakdown.destination,
    date_score: deal.score.breakdown.date,
    flight_quality_score: deal.score.breakdown.flightQuality,
    status: deal.status,
    detected_at: deal.detectedAt,
    verified_at: deal.verifiedAt,
    published_at: deal.publishedAt ?? null,
    expires_at: deal.expiresAt,
    fingerprint: deal.fingerprint,
    origin_airport_id: null as string | null,
  }));

  const origins = [...new Set(deals.map((deal) => deal.origin.code))];
  const { data: airports, error: airportError } = await client.from("airports").select("id,iata").in("iata", origins);
  if (airportError) throw new Error(`No se pudieron resolver aeropuertos: ${airportError.message}`);
  const ids = new Map((airports ?? []).map((airport) => [airport.iata as string, airport.id as string]));
  rows.forEach((row, index) => {
    row.origin_airport_id = ids.get(deals[index].origin.code) ?? null;
  });
  if (rows.some((row) => !row.origin_airport_id)) throw new Error("Falta un aeropuerto de origen en Supabase");
  const { data, error } = await client
    .from("deals")
    .upsert(rows, { onConflict: "provider,provider_reference", ignoreDuplicates: false })
    .select("id");
  if (error) throw new Error(`No se pudieron guardar candidatos: ${error.message}`);
  return data?.length ?? 0;
}

export async function replacePublishedDeals(deals: readonly Deal[]) {
  if (deals.length === 0) {
    throw new Error("No se reemplazará el catálogo con una consulta vacía");
  }

  const saved = await saveDiscoveredDeals(deals);
  const activeKeys = new Set(deals.map((deal) => `${deal.provider}:${deal.providerDealId}`));
  const client = await dbClient(true);

  if (!client) {
    let expired = 0;
    const store = getDemoStore();
    for (const [id, deal] of store.deals) {
      if (deal.status !== DealStatus.PUBLISHED || activeKeys.has(`${deal.provider}:${deal.providerDealId}`)) continue;
      const timestamp = new Date().toISOString();
      store.deals.set(id, { ...deal, status: DealStatus.EXPIRED, expiresAt: timestamp, updatedAt: timestamp });
      expired += 1;
    }
    return { saved, expired };
  }

  const { data: published, error: listError } = await client
    .from("deals")
    .select("id,provider,provider_reference")
    .eq("status", DealStatus.PUBLISHED);
  if (listError) throw new Error(`No se pudo revisar el catálogo publicado: ${listError.message}`);

  const obsoleteIds = (published ?? [])
    .filter((deal) => !activeKeys.has(`${deal.provider as string}:${deal.provider_reference as string}`))
    .map((deal) => deal.id as string);
  const timestamp = new Date().toISOString();

  for (let index = 0; index < obsoleteIds.length; index += 100) {
    const batch = obsoleteIds.slice(index, index + 100);
    const { error } = await client
      .from("deals")
      .update({ status: DealStatus.EXPIRED, expires_at: timestamp, updated_at: timestamp })
      .in("id", batch);
    if (error) throw new Error(`No se pudieron retirar ofertas antiguas: ${error.message}`);
  }

  return { saved, expired: obsoleteIds.length };
}

export async function verifyActiveDeals() {
  const deals = (await listAdminDeals()).filter((deal) =>
    [DealStatus.REVIEW, DealStatus.APPROVED, DealStatus.PUBLISHED].includes(deal.status),
  );
  await Promise.all(deals.map((deal) => reverifyDeal(deal.id)));
  return deals.length;
}

export async function expireDueDeals(now = new Date()) {
  const deals = (await listAdminDeals()).filter(
    (deal) => deal.status === DealStatus.PUBLISHED && deal.expiresAt && new Date(deal.expiresAt) <= now,
  );
  await Promise.all(deals.map((deal) => transitionDeal(deal.id, DealStatus.EXPIRED)));
  return deals.length;
}
