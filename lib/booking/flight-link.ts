import type { Deal } from "@/lib/domain/types";

const datePart = (value: string) => value.slice(0, 10);

export function buildExactFlightSearchUrl(deal: Deal): URL {
  const url = new URL("https://www.google.com/travel/flights");
  const terms = [
    `Vuelo ${deal.origin.code} a ${deal.destination.code}`,
    `salida ${datePart(deal.travelStartDate)}`,
    deal.tripType === "ROUND_TRIP" ? `regreso ${datePart(deal.travelEndDate)}` : "solo ida",
    `aerolínea ${deal.airline}`,
    ...(deal.flightNumber ? [`vuelo ${deal.flightNumber}`] : []),
  ];
  url.searchParams.set("q", terms.join(" · "));
  url.searchParams.set("hl", "es");
  url.searchParams.set("gl", "mx");
  url.searchParams.set("curr", deal.currency);
  return url;
}

export function isGoogleFlightsUrl(value: URL): boolean {
  return value.hostname === "www.google.com" && value.pathname.startsWith("/travel/flights");
}

export function getBookingFallback(deal: Deal, storedUrl: URL): URL {
  return isGoogleFlightsUrl(storedUrl) ? buildExactFlightSearchUrl(deal) : storedUrl;
}
