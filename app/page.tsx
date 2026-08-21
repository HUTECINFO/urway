import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, Search, ShieldCheck } from "lucide-react";
import { AirportSelector } from "@/components/public/airport-selector";
import { DealCard } from "@/components/public/deal-card";
import { DestinationHero } from "@/components/public/destination-hero";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { listPublishedDeals } from "@/lib/data/deals";
import { DEMO_AIRPORTS } from "@/lib/demo/airports";
import { DealType } from "@/lib/domain/types";

export const metadata: Metadata = {
  title: "Ofertas de viaje que sí valen la pena",
  description: "Drops de vuelos seleccionados y analizados por UR WAY. Descubre tarifas excepcionales desde los principales aeropuertos de México.",
  alternates: { canonical: "/" },
};

interface HomeProps {
  searchParams: Promise<{ origen?: string | string[] }>;
}

const mexicoAirports = DEMO_AIRPORTS.filter((airport) => airport.countryCode === "MX");

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const requestedOrigin = typeof query.origen === "string" ? query.origen.toUpperCase() : "";
  const selectedOrigin = mexicoAirports.some((airport) => airport.code === requestedOrigin) ? requestedOrigin : "";
  const deals = await listPublishedDeals(selectedOrigin || undefined);
  const featuredDeal = deals.find((deal) => deal.featured) ?? deals[0];
  const todayDeals = deals.filter((deal) => deal.dealType === DealType.TODAY).slice(0, 3);
  const curatedTodayDeals = todayDeals.length ? todayDeals : deals.slice(0, 3);
  const flashDeals = deals.filter((deal) => deal.dealType === DealType.FLASH).slice(0, 3);
  const recentDeals = [...deals]
    .sort((left, right) => new Date(right.publishedAt ?? right.updatedAt).getTime() - new Date(left.publishedAt ?? left.updatedAt).getTime())
    .slice(0, 6);
  const selectedAirport = mexicoAirports.find((airport) => airport.code === selectedOrigin);

  return (
    <>
      <PublicHeader />
      <main>
        <DestinationHero deal={featuredDeal}>
          <AirportSelector airports={mexicoAirports} selected={selectedOrigin} />
        </DestinationHero>

        <section id="drops" className="scroll-mt-24 py-18 sm:py-24">
          <div className="container-page">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Selección editorial</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.055em] text-midnight sm:text-5xl">Drops de hoy</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate">
                  {selectedAirport
                    ? `Tarifas verificadas con salida desde ${selectedAirport.city}.`
                    : "Las oportunidades más interesantes que encontramos saliendo de México."}
                </p>
              </div>
              {selectedOrigin && (
                <Link href="/#drops" className="inline-flex items-center gap-2 text-sm font-extrabold text-midnight hover:text-coral">
                  Ver todas las salidas <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              )}
            </div>

            {curatedTodayDeals.length > 0 ? (
              <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {curatedTodayDeals.map((deal, index) => <DealCard deal={deal} priority={index === 0} key={deal.id} />)}
              </div>
            ) : (
              <div className="mt-9 rounded-[2rem] border border-midnight/8 bg-white p-8 text-center sm:p-12">
                <h3 className="font-display text-2xl font-extrabold tracking-[-0.04em]">No hay Drops desde este aeropuerto por ahora.</h3>
                <p className="mx-auto mt-3 max-w-lg text-slate">Las tarifas cambian todos los días. Elige otra salida o apúntate para recibir la próxima oportunidad.</p>
                <Link href="/#drops" className="mt-6 inline-flex rounded-full bg-midnight px-5 py-3 text-sm font-extrabold text-white">Ver todos los aeropuertos</Link>
              </div>
            )}
          </div>
        </section>

        {flashDeals.length > 0 && (
          <section className="bg-midnight py-18 text-white sm:py-24" aria-labelledby="flash-title">
            <div className="container-page">
              <div className="grid gap-6 lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Reserva con intención</p>
                  <h2 id="flash-title" className="mt-2 font-display text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">Flash<br />Drops</h2>
                  <p className="mt-4 max-w-sm leading-7 text-white/55">Precios especialmente bajos que suelen durar poco. Revisamos la ruta y las condiciones antes de mostrarlos.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {flashDeals.map((deal) => <DealCard deal={deal} key={deal.id} />)}
                </div>
              </div>
            </div>
          </section>
        )}

        {recentDeals.length > 0 && (
          <section className="py-18 sm:py-24" aria-labelledby="recent-title">
            <div className="container-page">
              <div className="max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Recién verificados</p>
                <h2 id="recent-title" className="mt-2 font-display text-3xl font-extrabold tracking-[-0.055em] sm:text-5xl">Drops recientes</h2>
                <p className="mt-3 leading-7 text-slate">Una mirada rápida a las últimas oportunidades que pasaron nuestro filtro editorial.</p>
              </div>
              <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentDeals.map((deal) => <DealCard deal={deal} key={deal.id} />)}
              </div>
            </div>
          </section>
        )}

        <section id="como-funciona" className="scroll-mt-24 bg-sand py-18 sm:py-24" aria-labelledby="how-title">
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Detrás de cada Drop</p>
                <h2 id="how-title" className="mt-3 text-balance font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-6xl">No publicamos todo. Solo lo que vale el viaje.</h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate">Nuestro score no premia únicamente un precio bajo. Considera ahorro real, calidad del vuelo, fechas y qué tan especial es el destino.</p>
              </div>
              <ol className="grid gap-px overflow-hidden rounded-[2rem] border border-midnight/8 bg-midnight/8">
                <li className="grid gap-4 bg-white p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                  <span className="flex size-11 items-center justify-center rounded-full bg-sand text-midnight"><Search aria-hidden="true" className="size-5" /></span>
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">01 · Encontramos</p><h3 className="mt-2 font-display text-xl font-extrabold">Escaneamos rutas y tarifas</h3><p className="mt-2 leading-7 text-slate">Buscamos anomalías de precio y ventanas de viaje interesantes desde México.</p></div>
                </li>
                <li className="grid gap-4 bg-white p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                  <span className="flex size-11 items-center justify-center rounded-full bg-sand text-midnight"><ShieldCheck aria-hidden="true" className="size-5" /></span>
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">02 · Analizamos</p><h3 className="mt-2 font-display text-xl font-extrabold">Leemos la letra pequeña</h3><p className="mt-2 leading-7 text-slate">Comparamos el precio habitual, escalas, equipaje, horarios y vigencia.</p></div>
                </li>
                <li className="grid gap-4 bg-white p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                  <span className="flex size-11 items-center justify-center rounded-full bg-sand text-midnight"><BellRing aria-hidden="true" className="size-5" /></span>
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">03 · Te avisamos</p><h3 className="mt-2 font-display text-xl font-extrabold">Tú decides cómo viajar</h3><p className="mt-2 leading-7 text-slate">Publicamos el contexto necesario y te llevamos al proveedor para reservar.</p></div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section id="newsletter" className="scroll-mt-24 bg-coral py-18 sm:py-24" aria-labelledby="newsletter-title">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-midnight/60">Tu próxima historia puede empezar aquí</p>
              <h2 id="newsletter-title" className="mt-3 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.06em] text-midnight sm:text-6xl">Los mejores Drops, antes de que despeguen.</h2>
            </div>
            <div>
              <NewsletterForm source="website" />
              <p className="mt-1 text-xs leading-5 text-midnight/60">Sin spam ni ofertas infinitas. Solo oportunidades seleccionadas.</p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
