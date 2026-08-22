import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing, Search, ShieldCheck } from "lucide-react";
import { AirportSelector } from "@/components/public/airport-selector";
import { DealCard } from "@/components/public/deal-card";
import { DestinationHero } from "@/components/public/destination-hero";
import { EditorialDeal } from "@/components/public/editorial-deal";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { listPublishedDeals } from "@/lib/data/deals";
import { DEMO_AIRPORTS } from "@/lib/demo/airports";

export const metadata: Metadata = {
  title: "Vuelos que sí valen la pena",
  description: "Encontramos tarifas excepcionales, revisamos la ruta y te mostramos oportunidades reales desde México.",
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
  const spotlightDeals = deals.slice(0, 3);
  const spotlightIds = new Set(spotlightDeals.map((deal) => deal.id));
  const secondaryDeals = deals.filter((deal) => !spotlightIds.has(deal.id)).slice(0, 3);
  const selectedAirport = mexicoAirports.find((airport) => airport.code === selectedOrigin);

  return (
    <>
      <PublicHeader />
      <main>
        <DestinationHero deal={featuredDeal}>
          <AirportSelector airports={mexicoAirports} selected={selectedOrigin} inverse />
        </DestinationHero>

        <section className="bg-sand py-24 sm:py-32 lg:py-40" aria-label="Manifiesto UR WAY">
          <div className="container-page">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">La promesa</p>
            <p className="mt-6 max-w-6xl text-balance font-display text-[clamp(2.8rem,7vw,7.2rem)] font-extrabold leading-[0.88] tracking-[-0.075em] text-midnight">
              No necesitas más pestañas. Necesitas una buena razón para hacer <span className="text-coral">la maleta.</span>
            </p>
            <div className="mt-12 grid gap-6 border-t border-midnight/12 pt-8 text-base leading-7 text-slate md:grid-cols-3">
              <p>Comparamos cada tarifa con lo que normalmente cuesta esa misma ruta.</p>
              <p>Revisamos escalas, equipaje, horarios y fechas antes de recomendarla.</p>
              <p>Te dejamos una selección corta para que decidir sea tan fácil como despegar.</p>
            </div>
          </div>
        </section>

        <section id="drops" className="scroll-mt-24 bg-background py-24 sm:py-32" aria-labelledby="drops-title">
          <div className="container-page">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">La selección de hoy</p>
                <h2 id="drops-title" className="mt-3 text-balance font-display text-[clamp(3.5rem,8vw,7.5rem)] font-extrabold leading-[0.82] tracking-[-0.08em] text-midnight">Rutas que sí despegan.</h2>
              </div>
              <p className="max-w-sm text-base leading-7 text-slate">
                {selectedAirport ? `Oportunidades verificadas con salida desde ${selectedAirport.city}.` : "Una mezcla poco común de buen precio, buena ruta y ganas de irte."}
              </p>
            </div>

            {spotlightDeals.length > 0 ? (
              <div className="mt-12 grid gap-8 sm:mt-16 sm:gap-12">
                {spotlightDeals.map((deal, index) => <EditorialDeal deal={deal} index={index} key={deal.id} />)}
                <div className="flex justify-center pt-2"><Link href="/drops" className="inline-flex min-h-13 items-center gap-2 rounded-2xl bg-midnight px-6 text-sm font-extrabold text-white transition hover:bg-coral hover:text-midnight">Ver todas las rutas <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
              </div>
            ) : (
              <div className="mt-12 rounded-[2.5rem] bg-white p-8 text-center shadow-[0_20px_70px_rgba(13,27,42,.08)] sm:p-14">
                <h3 className="font-display text-3xl font-extrabold tracking-[-0.055em]">Aún no hay una ruta para esta salida.</h3>
                <p className="mx-auto mt-4 max-w-lg leading-7 text-slate">Prueba otro aeropuerto o recibe un aviso cuando aparezca una tarifa que sí merezca el viaje.</p>
                <Link href="/#drops" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-midnight px-5 text-sm font-extrabold text-white">Cambiar aeropuerto <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
            )}
          </div>
        </section>

        {secondaryDeals.length > 0 && (
          <section className="bg-white py-24 sm:py-32" aria-labelledby="more-title">
            <div className="container-page">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Más rutas para mirar</p>
                  <h2 id="more-title" className="mt-3 font-display text-4xl font-extrabold tracking-[-0.065em] text-midnight sm:text-6xl">Por si ya quieres irte.</h2>
                </div>
                <Link href="#newsletter" className="inline-flex items-center gap-2 text-sm font-extrabold text-midnight transition hover:text-coral">Recibir el próximo aviso <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {secondaryDeals.map((deal) => <DealCard deal={deal} key={deal.id} />)}
              </div>
            </div>
          </section>
        )}

        <section id="como-funciona" className="scroll-mt-24 overflow-hidden bg-midnight py-24 text-white sm:py-32 lg:py-40" aria-labelledby="how-title">
          <div className="container-page">
            <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Cómo decidimos</p>
                <h2 id="how-title" className="mt-5 text-balance font-display text-[clamp(3.5rem,7vw,7rem)] font-extrabold leading-[0.82] tracking-[-0.08em]">Menos pestañas.<br /><span className="text-coral">Más criterio.</span></h2>
                <p className="mt-7 max-w-lg text-lg leading-8 text-white/55">Un precio bajo no basta. Buscamos la combinación que convierte una tarifa en un viaje que de verdad quieres hacer.</p>
              </div>
              <ol className="border-t border-white/15">
                <li className="grid gap-6 border-b border-white/15 py-10 sm:grid-cols-[5rem_1fr] sm:py-12">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/8 text-coral"><Search aria-hidden="true" className="size-6" /></span>
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">01 · Detectamos</p><h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] sm:text-4xl">Encontramos lo que se sale de la norma.</h3><p className="mt-4 max-w-xl leading-7 text-white/50">Comparamos rutas y temporadas para distinguir una tarifa realmente excepcional de un descuento cualquiera.</p></div>
                </li>
                <li className="grid gap-6 border-b border-white/15 py-10 sm:grid-cols-[5rem_1fr] sm:py-12">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/8 text-coral"><ShieldCheck aria-hidden="true" className="size-6" /></span>
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">02 · Revisamos</p><h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] sm:text-4xl">El precio nunca cuenta toda la historia.</h3><p className="mt-4 max-w-xl leading-7 text-white/50">Revisamos fechas, escalas, equipaje, horarios y vigencia para que sepas qué estás comprando.</p></div>
                </li>
                <li className="grid gap-6 border-b border-white/15 py-10 sm:grid-cols-[5rem_1fr] sm:py-12">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/8 text-coral"><BellRing aria-hidden="true" className="size-6" /></span>
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">03 · Te avisamos</p><h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] sm:text-4xl">La decisión sigue siendo tuya.</h3><p className="mt-4 max-w-xl leading-7 text-white/50">Te mostramos la señal, el contexto y el camino al proveedor. Tú decides cuándo despegar.</p></div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section id="newsletter" className="relative scroll-mt-24 overflow-hidden bg-coral py-24 sm:py-32 lg:py-40" aria-labelledby="newsletter-title">
          <Image src="/brand/urway-mark.png" alt="" width={620} height={620} className="pointer-events-none absolute -bottom-32 -right-32 w-[32rem] rotate-[-8deg] opacity-[0.09] sm:w-[44rem]" />
          <div className="container-page relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-midnight/55">Para cuando aparezca el vuelo correcto</p>
              <h2 id="newsletter-title" className="mt-5 max-w-4xl text-balance font-display text-[clamp(3.5rem,8vw,7.5rem)] font-extrabold leading-[0.82] tracking-[-0.08em] text-midnight">Te avisamos antes de que se vaya.</h2>
            </div>
            <div className="rounded-[2rem] bg-white/36 p-5 backdrop-blur-md sm:p-7">
              <p className="mb-5 font-display text-2xl font-bold leading-tight tracking-[-0.045em] text-midnight">Un aviso breve cuando aparezca una ruta que sí convenga.</p>
              <NewsletterForm source="website" />
              <p className="mt-1 text-xs leading-5 text-midnight/55">Sin ruido, sin correos diarios. Te puedes dar de baja cuando quieras.</p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
