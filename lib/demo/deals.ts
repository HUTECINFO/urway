import { createDealFingerprint } from "../domain/dedup";
import { calculateDealScore } from "../domain/scoring";
import { getCountryImageUrl } from "../media/country-images";
import {
  DealStatus,
  DealType,
  TripType,
  type Deal,
} from "../domain/types";
import { getAirport } from "./airports";

interface DemoDealTemplate {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: number;
  normalPrice: number;
  airline: string;
  flightNumber: string;
  stops: number;
  durationMinutes: number;
  durationDays: number;
  baggage: string;
  imageUrl: string;
  status: DealStatus;
  dealType: DealType;
  title: string;
  shortCopy: string;
}

const TEMPLATES: readonly DemoDealTemplate[] = [
  { id: "mex-nrt-10890", origin: "MEX", destination: "NRT", departureDate: "2026-05-12T05:00:00.000Z", returnDate: "2026-05-22T07:30:00.000Z", price: 10890, normalPrice: 18990, airline: "Aeroméxico", flightNumber: "AM58", stops: 0, durationMinutes: 870, durationDays: 10, baggage: "Artículo personal, equipaje de mano de 10 kg y una maleta documentada de 23 kg", imageUrl: getCountryImageUrl("JP"), status: DealStatus.PUBLISHED, dealType: DealType.FLASH, title: "Tokio directo desde CDMX por $10,890", shortCopy: "Japón sin escalas por menos de $11 mil MXN." },
  { id: "mex-mad-9490", origin: "MEX", destination: "MAD", departureDate: "2026-05-28T02:40:00.000Z", returnDate: "2026-06-06T12:10:00.000Z", price: 9490, normalPrice: 16990, airline: "Iberia", flightNumber: "IB304", stops: 0, durationMinutes: 660, durationDays: 9, baggage: "Artículo personal y equipaje de mano de 10 kg", imageUrl: getCountryImageUrl("ES"), status: DealStatus.PUBLISHED, dealType: DealType.LONG_HAUL, title: "Madrid directo desde CDMX por $9,490", shortCopy: "Cruza el Atlántico directo y ahorra $7,500 MXN." },
  { id: "bjx-mad-11990", origin: "BJX", destination: "MAD", departureDate: "2026-06-10T23:20:00.000Z", returnDate: "2026-06-18T10:30:00.000Z", price: 11990, normalPrice: 19490, airline: "Aeroméxico", flightNumber: "AM153", stops: 1, durationMinutes: 845, durationDays: 8, baggage: "Artículo personal, equipaje de mano de 10 kg y una maleta documentada de 23 kg", imageUrl: getCountryImageUrl("ES"), status: DealStatus.APPROVED, dealType: DealType.LONG_HAUL, title: "Del Bajío a Madrid por $11,990", shortCopy: "Europa desde León con una escala y equipaje documentado." },
  { id: "mex-jfk-4190", origin: "MEX", destination: "JFK", departureDate: "2026-04-23T13:10:00.000Z", returnDate: "2026-04-28T21:20:00.000Z", price: 4190, normalPrice: 7790, airline: "Viva", flightNumber: "VB100", stops: 0, durationMinutes: 305, durationDays: 5, baggage: "Artículo personal incluido; equipaje adicional con costo", imageUrl: getCountryImageUrl("US"), status: DealStatus.PUBLISHED, dealType: DealType.FLASH, title: "Nueva York directo por $4,190", shortCopy: "Cinco días en Nueva York a precio de escapada nacional." },
  { id: "gdl-cdg-10990", origin: "GDL", destination: "CDG", departureDate: "2026-06-19T01:30:00.000Z", returnDate: "2026-06-28T09:45:00.000Z", price: 10990, normalPrice: 19990, airline: "Air France", flightNumber: "AF179", stops: 1, durationMinutes: 850, durationDays: 9, baggage: "Artículo personal y equipaje de mano de 12 kg", imageUrl: getCountryImageUrl("FR"), status: DealStatus.REVIEW, dealType: DealType.LONG_HAUL, title: "París desde Guadalajara por $10,990", shortCopy: "París ida y vuelta con un ahorro cercano al 45%." },
  { id: "mty-yvr-5490", origin: "MTY", destination: "YVR", departureDate: "2026-07-08T14:15:00.000Z", returnDate: "2026-07-14T19:25:00.000Z", price: 5490, normalPrice: 9490, airline: "Air Canada", flightNumber: "AC996", stops: 0, durationMinutes: 300, durationDays: 6, baggage: "Artículo personal y equipaje de mano de 10 kg", imageUrl: getCountryImageUrl("CA"), status: DealStatus.APPROVED, dealType: DealType.CITY, title: "Vancouver directo desde Monterrey por $5,490", shortCopy: "Canadá sin escalas desde Monterrey por menos de $5,500." },
  { id: "nlu-cun-1490", origin: "NLU", destination: "CUN", departureDate: "2026-04-03T12:00:00.000Z", returnDate: "2026-04-06T22:10:00.000Z", price: 1490, normalPrice: 3690, airline: "Viva", flightNumber: "VB2282", stops: 0, durationMinutes: 135, durationDays: 3, baggage: "Artículo personal incluido; equipaje adicional con costo", imageUrl: getCountryImageUrl("MX"), status: DealStatus.DISCOVERED, dealType: DealType.TODAY, title: "Cancún desde el AIFA por $1,490", shortCopy: "Una escapada de playa de tres días a precio flash." },
  { id: "qro-las-2990", origin: "QRO", destination: "LAS", departureDate: "2026-07-17T16:20:00.000Z", returnDate: "2026-07-20T18:40:00.000Z", price: 2990, normalPrice: 5790, airline: "Viva", flightNumber: "VB602", stops: 1, durationMinutes: 315, durationDays: 3, baggage: "Artículo personal incluido; equipaje de mano disponible con costo", imageUrl: getCountryImageUrl("US"), status: DealStatus.REVIEW, dealType: DealType.WEEKEND, title: "Fin de semana en Las Vegas por $2,990", shortCopy: "Tres noches desde Querétaro y casi 50% de ahorro." },
  { id: "tij-nrt-9990", origin: "TIJ", destination: "NRT", departureDate: "2026-09-07T08:50:00.000Z", returnDate: "2026-09-17T06:25:00.000Z", price: 9990, normalPrice: 17990, airline: "ZIPAIR", flightNumber: "ZG25", stops: 0, durationMinutes: 690, durationDays: 10, baggage: "Artículo personal y equipaje de mano de 7 kg", imageUrl: getCountryImageUrl("JP"), status: DealStatus.APPROVED, dealType: DealType.FLASH, title: "Tokio directo desde Tijuana por $9,990", shortCopy: "Japón directo desde la frontera por menos de $10 mil." },
  { id: "cun-bog-4590", origin: "CUN", destination: "BOG", departureDate: "2026-02-13T15:10:00.000Z", returnDate: "2026-02-18T20:30:00.000Z", price: 4590, normalPrice: 8290, airline: "Volaris", flightNumber: "Y43912", stops: 0, durationMinutes: 205, durationDays: 5, baggage: "Artículo personal incluido", imageUrl: getCountryImageUrl("CO"), status: DealStatus.EXPIRED, dealType: DealType.CITY, title: "Bogotá directo desde Cancún por $4,590", shortCopy: "Tarifa histórica a Colombia; esta ventana ya terminó." },
  { id: "gdl-lax-3290", origin: "GDL", destination: "LAX", departureDate: "2026-08-21T14:35:00.000Z", returnDate: "2026-08-24T23:05:00.000Z", price: 3290, normalPrice: 6190, airline: "Volaris", flightNumber: "Y41710", stops: 0, durationMinutes: 205, durationDays: 3, baggage: "Artículo personal incluido; equipaje adicional con costo", imageUrl: getCountryImageUrl("US"), status: DealStatus.REJECTED, dealType: DealType.WEEKEND, title: "Los Ángeles desde Guadalajara por $3,290", shortCopy: "Buena tarifa, descartada tras cambiar las condiciones." },
  { id: "mex-lim-6990", origin: "MEX", destination: "LIM", departureDate: "2026-08-06T21:30:00.000Z", returnDate: "2026-08-13T11:15:00.000Z", price: 6990, normalPrice: 11990, airline: "LATAM", flightNumber: "LA2473", stops: 0, durationMinutes: 355, durationDays: 7, baggage: "Artículo personal y equipaje de mano de 10 kg", imageUrl: getCountryImageUrl("PE"), status: DealStatus.PUBLISHED, dealType: DealType.CITY, title: "Lima directo desde CDMX por $6,990", shortCopy: "Una semana en Perú con vuelo directo y 42% de ahorro." },
  { id: "mty-hav-3490", origin: "MTY", destination: "HAV", departureDate: "2026-09-18T17:45:00.000Z", returnDate: "2026-09-23T19:15:00.000Z", price: 3490, normalPrice: 6490, airline: "Viva", flightNumber: "VB312", stops: 1, durationMinutes: 310, durationDays: 5, baggage: "Artículo personal incluido; equipaje adicional con costo", imageUrl: getCountryImageUrl("CU"), status: DealStatus.DISCOVERED, dealType: DealType.BEACH, title: "La Habana desde Monterrey por $3,490", shortCopy: "Cinco días de Caribe con salida desde Monterrey." },
  { id: "mex-eze-12490", origin: "MEX", destination: "EZE", departureDate: "2026-10-09T12:10:00.000Z", returnDate: "2026-10-19T23:40:00.000Z", price: 12490, normalPrice: 20990, airline: "Copa Airlines", flightNumber: "CM195", stops: 1, durationMinutes: 825, durationDays: 10, baggage: "Artículo personal, equipaje de mano de 10 kg y una maleta documentada de 23 kg", imageUrl: getCountryImageUrl("AR"), status: DealStatus.PUBLISHED, dealType: DealType.LONG_HAUL, title: "Buenos Aires desde CDMX por $12,490", shortCopy: "Argentina por diez días con $8,500 MXN de ahorro." },
];

const scoringNow = new Date();

export const DEMO_DEALS: readonly Deal[] = TEMPLATES.map((template, index) => {
  const origin = getAirport(template.origin);
  const destination = getAirport(template.destination);
  const isExpired = template.status === DealStatus.EXPIRED;
  const departureDate = new Date(
    scoringNow.getTime() + (isExpired ? -45 : 28 + index * 7) * 86_400_000,
  );
  const returnDate = new Date(departureDate.getTime() + template.durationDays * 86_400_000);
  const detectedAt = new Date(
    scoringNow.getTime() - (isExpired ? 60 * 24 : 2 + index) * 3_600_000,
  ).toISOString();
  const verifiedAt = new Date(
    scoringNow.getTime() - (isExpired ? 59 * 24 : 1 + index) * 3_600_000,
  ).toISOString();
  const base = {
    provider: "demo-mx",
    providerDealId: template.id,
    origin,
    destination,
    departureDate: departureDate.toISOString(),
    returnDate: returnDate.toISOString(),
    tripType: TripType.ROUND_TRIP,
    price: template.price,
    originalPrice: template.normalPrice,
    currency: "MXN",
    airline: template.airline,
    flightNumber: template.flightNumber,
    stops: template.stops,
    durationMinutes: template.durationMinutes,
    overnight: departureDate.getUTCHours() >= 20,
    cabinClass: "economy",
    bookingUrl: `https://www.google.com/travel/flights?q=${encodeURIComponent(`${template.origin} a ${template.destination}`)}`,
  };
  const fingerprint = createDealFingerprint(base);
  const score = calculateDealScore(base, { date: { now: scoringNow } });
  const savings = template.normalPrice - template.price;
  const savingsPercentage = Math.round((savings / template.normalPrice) * 1_000) / 10;
  const publishedAt = template.status === DealStatus.PUBLISHED
    ? new Date(scoringNow.getTime() - (30 + index) * 60_000).toISOString()
    : undefined;
  return {
    ...base,
    id: `demo-${template.id}`,
    title: template.title,
    slug: template.id,
    description: `${template.shortCopy} Vuelo redondo de ${origin.city} a ${destination.city} con ${template.airline}. Precio por persona en clase económica; sujeto a disponibilidad y cambios al reservar.`,
    shortCopy: template.shortCopy,
    status: template.status,
    dealType: template.dealType,
    normalPrice: template.normalPrice,
    savings,
    savingsPercentage,
    baggage: template.baggage,
    durationDays: template.durationDays,
    dateWindow: {
      start: departureDate.toISOString(),
      end: new Date(departureDate.getTime() + 2 * 86_400_000).toISOString(),
      flexible: true,
    },
    travelStartDate: departureDate.toISOString(),
    travelEndDate: returnDate.toISOString(),
    imageUrl: template.imageUrl,
    fingerprint,
    score,
    tags: [
      template.stops === 0 ? "Vuelo directo" : `${template.stops} escala`,
      `${template.durationDays} días`,
      `Ahorra $${savings.toLocaleString("es-MX")} MXN`,
      destination.country,
    ],
    featured: score.total >= 85 && template.status === DealStatus.PUBLISHED,
    detectedAt,
    verifiedAt,
    publishedAt,
    discoveredAt: detectedAt,
    expiresAt: new Date(
      scoringNow.getTime() + (isExpired ? -10 : 45) * 86_400_000,
    ).toISOString(),
    createdAt: detectedAt,
    updatedAt: verifiedAt,
  };
});

export const demoDeals = DEMO_DEALS;
