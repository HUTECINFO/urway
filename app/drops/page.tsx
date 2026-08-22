import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { AirportSelector } from "@/components/public/airport-selector";
import { DealCard } from "@/components/public/deal-card";
import { getDealTypeLabel } from "@/components/public/deal-badge";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { listPublishedDeals } from "@/lib/data/deals";
import { DEMO_AIRPORTS } from "@/lib/demo/airports";
import { DealType } from "@/lib/domain/types";

export const metadata: Metadata = {
  title: "Rutas seleccionadas",
  description: "Explora vuelos con buen precio, buena ruta y contexto claro desde tu aeropuerto de salida.",
  alternates: { canonical: "/drops" },
};

interface DropsPageProps {
  searchParams: Promise<{ origen?: string | string[]; tipo?: string | string[] }>;
}

const mexicoAirports = DEMO_AIRPORTS.filter((airport) => airport.countryCode === "MX");
const dealTypes = Object.values(DealType);

function filterHref(origin: string, type?: DealType) {
  const params = new URLSearchParams();
  if (origin) params.set("origen", origin);
  if (type) params.set("tipo", type);
  const query = params.toString();
  return `/drops${query ? `?${query}` : ""}#drops`;
}

export default async function DropsPage({ searchParams }: DropsPageProps) {
  const query = await searchParams;
  const requestedOrigin = typeof query.origen === "string" ? query.origen.toUpperCase() : "";
  const selectedOrigin = mexicoAirports.some((airport) => airport.code === requestedOrigin) ? requestedOrigin : "";
  const requestedType = typeof query.tipo === "string" ? query.tipo.toUpperCase() : "";
  const selectedType = dealTypes.includes(requestedType as DealType) ? requestedType as DealType : undefined;
  const allDeals = await listPublishedDeals(selectedOrigin || undefined);
  const deals = selectedType ? allDeals.filter((deal) => deal.dealType === selectedType) : allDeals;
  const selectedAirport = mexicoAirports.find((airport) => airport.code === selectedOrigin);

  return (
    <>
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden bg-midnight pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
          <Image src="/brand/urway-mark.png" alt="" width={640} height={640} className="pointer-events-none absolute -right-32 -top-28 w-[34rem] rotate-[-8deg] opacity-[0.08] sm:w-[44rem]" priority />
          <div className="container-page relative grid gap-10 lg:grid-cols-[1fr_23rem] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.19em] text-coral">La selección completa</p>
              <h1 className="mt-5 max-w-5xl text-balance font-display text-[clamp(4.3rem,10vw,9rem)] font-extrabold leading-[0.78] tracking-[-0.085em]">Buenas rutas.<br /><span className="text-coral">Cero relleno.</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/58">Cada oportunidad pasó por el mismo filtro. Elige una salida, compara con calma y abre solo la ruta que te haga querer irte.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/14 bg-white/8 p-5 backdrop-blur-md">
              <AirportSelector airports={mexicoAirports} selected={selectedOrigin} inverse />
            </div>
          </div>
        </section>

        <section id="drops" className="scroll-mt-24 bg-background py-20 sm:py-28" aria-labelledby="catalog-title">
          <div className="container-page">
            <div className="flex flex-col gap-7 border-b border-midnight/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.17em] text-coral"><SlidersHorizontal aria-hidden="true" className="size-4" /> Encuentra tu salida</p>
                <h2 id="catalog-title" className="mt-3 font-display text-4xl font-extrabold tracking-[-0.065em] text-midnight sm:text-6xl">{deals.length} {deals.length === 1 ? "oportunidad" : "oportunidades"}{selectedAirport ? ` desde ${selectedAirport.city}` : " activas"}.</h2>
              </div>
              {(selectedOrigin || selectedType) && <Link href="/drops#drops" className="inline-flex items-center gap-2 text-sm font-extrabold text-midnight transition hover:text-coral">Limpiar filtros <ArrowRight aria-hidden="true" className="size-4" /></Link>}
            </div>

            <nav className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar por tipo de Drop">
              <Link href={filterHref(selectedOrigin)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition ${!selectedType ? "bg-midnight text-white" : "bg-white text-slate hover:text-midnight"}`}>Todos</Link>
              {dealTypes.map((type) => (
                <Link key={type} href={filterHref(selectedOrigin, type)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition ${selectedType === type ? "bg-coral text-midnight" : "bg-white text-slate hover:text-midnight"}`}>{getDealTypeLabel(type)}</Link>
              ))}
            </nav>

            {deals.length > 0 ? (
              <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal, index) => <DealCard deal={deal} priority={index < 3} key={deal.id} />)}
              </div>
            ) : (
              <div className="mt-10 rounded-[2.5rem] bg-white p-9 text-center shadow-[0_22px_70px_rgba(13,27,42,.07)] sm:p-14">
                <h3 className="font-display text-3xl font-extrabold tracking-[-0.055em] text-midnight">Todavía no encontramos esa combinación.</h3>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-slate">Prueba otro filtro o recibe un aviso cuando aparezca una oportunidad que sí encaje contigo.</p>
                <Link href="/drops#drops" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-midnight px-5 text-sm font-extrabold text-white">Quitar filtros <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-coral py-20 sm:py-28" aria-labelledby="drops-newsletter-title">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-midnight/55">Las buenas tarifas no esperan</p><h2 id="drops-newsletter-title" className="mt-4 max-w-4xl font-display text-5xl font-extrabold leading-[0.88] tracking-[-0.07em] text-midnight sm:text-7xl">Recíbelo antes de que se vaya.</h2></div>
            <NewsletterForm source="drops-page" />
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
