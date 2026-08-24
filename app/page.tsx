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
import { Reveal } from "@/components/ui/reveal";
import { listPublishedDeals } from "@/lib/data/deals";
import { DEMO_AIRPORTS } from "@/lib/demo/airports";

export const metadata: Metadata = {
  title: "Ofertas de vuelo que sí convienen",
  description: "Encontramos ofertas de vuelo fuera de lo común desde México, revisamos cada detalle y te llevamos a comparar con contexto.",
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
  const rankedDeals = [...deals].sort((left, right) =>
    left.price - right.price || right.score.total - left.score.total,
  );
  const featuredDeal = rankedDeals[0];
  const spotlightDeals = rankedDeals.slice(0, 3);
  const spotlightIds = new Set(spotlightDeals.map((deal) => deal.id));
  const secondaryDeals = rankedDeals.filter((deal) => !spotlightIds.has(deal.id)).slice(0, 3);
  const selectedAirport = mexicoAirports.find((airport) => airport.code === selectedOrigin);

  return (
    <>
      <PublicHeader />
      <main>
        <DestinationHero deal={featuredDeal}>
          <AirportSelector airports={mexicoAirports} selected={selectedOrigin} inverse />
        </DestinationHero>

        <section className="bg-sand py-20 sm:py-32 lg:py-40" aria-label="Manifiesto UR WAY">
          <div className="container-page">
            <Reveal>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">La promesa</p>
              <p className="mt-5 max-w-6xl text-balance font-display text-[clamp(2.45rem,10vw,7.2rem)] font-extrabold leading-[0.94] tracking-[-0.06em] text-midnight sm:mt-6 sm:leading-[0.88] sm:tracking-[-0.075em]">
                Encuentra la oferta.<br />Reserva <span className="text-coral">el viaje.</span>
              </p>
            </Reveal>
            <Reveal delay={0.08} distance={28} className="mt-9 grid gap-5 border-t border-midnight/12 pt-7 text-[15px] leading-6 text-slate sm:mt-12 sm:gap-6 sm:pt-8 sm:text-base sm:leading-7 md:grid-cols-3">
              <p><span className="mb-3 block font-display text-2xl font-extrabold text-midnight">01</span>Comparamos cada oferta con el precio habitual de la misma ruta.</p>
              <p><span className="mb-3 block font-display text-2xl font-extrabold text-midnight">02</span>Revisamos escalas, equipaje, horarios y fechas antes de publicarla.</p>
              <p><span className="mb-3 block font-display text-2xl font-extrabold text-midnight">03</span>Te mostramos una selección corta para decidir sin perder horas.</p>
            </Reveal>
          </div>
        </section>

        <section id="drops" className="scroll-mt-24 bg-background py-20 sm:py-32" aria-labelledby="drops-title">
          <div className="container-page">
            <Reveal className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">La selección de hoy</p>
                <h2 id="drops-title" className="mt-3 text-balance font-display text-[clamp(3rem,13vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.07em] text-midnight sm:leading-[0.82] sm:tracking-[-0.08em]">Ofertas que sí despegan.</h2>
              </div>
              <p className="max-w-sm text-base leading-7 text-slate">
                {selectedAirport ? `Ofertas verificadas con salida desde ${selectedAirport.city}.` : "Ofertas desde México, elegidas por precio, ruta y contexto."}
              </p>
            </Reveal>

            {spotlightDeals.length > 0 ? (
              <div className="mt-10 grid gap-7 sm:mt-16 sm:gap-12">
                {spotlightDeals.map((deal, index) => <Reveal key={deal.id} delay={Math.min(index * 0.05, 0.12)}><EditorialDeal deal={deal} index={index} /></Reveal>)}
                <div className="flex justify-center pt-2"><Link href="/drops" className="inline-flex min-h-13 items-center gap-2 rounded-2xl bg-midnight px-6 text-sm font-extrabold text-white transition hover:bg-coral hover:text-midnight">Ver todas las rutas <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
              </div>
            ) : (
              <div className="mt-12 rounded-[2.5rem] bg-white p-8 text-center shadow-[0_20px_70px_rgba(13,27,42,.08)] sm:p-14">
                <h3 className="font-display text-3xl font-extrabold tracking-[-0.055em]">Todavía no hay ofertas para esa salida.</h3>
                <p className="mx-auto mt-4 max-w-lg leading-7 text-slate">Prueba otro aeropuerto o recibe un aviso cuando encontremos una ruta que realmente convenga.</p>
                <Link href="/#drops" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-midnight px-5 text-sm font-extrabold text-white">Cambiar aeropuerto <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
            )}
          </div>
        </section>

        {secondaryDeals.length > 0 && (
          <section className="bg-white py-20 sm:py-32" aria-labelledby="more-title">
            <div className="container-page">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Más rutas para mirar</p>
                  <h2 id="more-title" className="mt-3 font-display text-[2.65rem] font-extrabold leading-[0.94] tracking-[-0.06em] text-midnight sm:text-6xl">Por si ya quieres irte.</h2>
                </div>
                <Link href="#newsletter" className="inline-flex items-center gap-2 text-sm font-extrabold text-midnight transition hover:text-coral">Recibir nuevas ofertas <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {secondaryDeals.map((deal) => <DealCard deal={deal} key={deal.id} />)}
              </div>
            </div>
          </section>
        )}

        <section id="como-funciona" className="scroll-mt-24 overflow-hidden bg-midnight py-20 text-white sm:py-32 lg:py-40" aria-labelledby="how-title">
          <div className="container-page">
            <div className="grid gap-12 sm:gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Cómo decidimos</p>
                <h2 id="how-title" className="mt-4 text-balance font-display text-[clamp(3rem,13vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.07em] sm:mt-5 sm:leading-[0.82] sm:tracking-[-0.08em]">Menos pestañas.<br /><span className="text-coral">Más claridad.</span></h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/55 sm:mt-7 sm:text-lg sm:leading-8">El precio más bajo no siempre es el mejor viaje. Buscamos la combinación que sí tiene sentido para ti.</p>
              </div>
              <ol className="border-t border-white/15">
                <li className="grid grid-cols-[3.25rem_1fr] gap-4 border-b border-white/15 py-8 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/8 text-coral sm:size-14"><Search aria-hidden="true" className="size-5 sm:size-6" /></span>
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-coral sm:text-xs">01 · Detectamos</p><h3 className="mt-2 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.05em] sm:mt-3 sm:text-4xl">Encontramos lo que se sale de la norma.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:mt-4 sm:text-base sm:leading-7">Comparamos rutas y temporadas para distinguir una oferta realmente excepcional de un descuento cualquiera.</p></div>
                </li>
                <li className="grid grid-cols-[3.25rem_1fr] gap-4 border-b border-white/15 py-8 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/8 text-coral sm:size-14"><ShieldCheck aria-hidden="true" className="size-5 sm:size-6" /></span>
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-coral sm:text-xs">02 · Revisamos</p><h3 className="mt-2 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.05em] sm:mt-3 sm:text-4xl">El precio nunca cuenta toda la historia.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:mt-4 sm:text-base sm:leading-7">Revisamos fechas, escalas, equipaje, horarios y vigencia para que sepas qué estás comprando.</p></div>
                </li>
                <li className="grid grid-cols-[3.25rem_1fr] gap-4 border-b border-white/15 py-8 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/8 text-coral sm:size-14"><BellRing aria-hidden="true" className="size-5 sm:size-6" /></span>
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-coral sm:text-xs">03 · Te orientamos</p><h3 className="mt-2 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.05em] sm:mt-3 sm:text-4xl">La decisión sigue siendo tuya.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:mt-4 sm:text-base sm:leading-7">Te mostramos la ruta, el contexto y el camino para comparar agencias. Tú decides cuándo reservar.</p></div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section id="newsletter" className="relative scroll-mt-24 overflow-hidden bg-coral py-20 sm:py-32 lg:py-40" aria-labelledby="newsletter-title">
          <Image src="/brand/urway-mark.png" alt="" width={620} height={620} className="pointer-events-none absolute -bottom-32 -right-32 w-[32rem] rotate-[-8deg] opacity-[0.09] sm:w-[44rem]" />
          <div className="container-page relative grid gap-8 sm:gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-midnight/55">Para cuando aparezca tu próximo viaje</p>
              <h2 id="newsletter-title" className="mt-4 max-w-4xl text-balance font-display text-[clamp(3rem,13vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.07em] text-midnight sm:mt-5 sm:leading-[0.82] sm:tracking-[-0.08em]">Recibe la oferta antes de que desaparezca.</h2>
            </div>
            <div className="rounded-[1.5rem] bg-white/36 p-4 backdrop-blur-md sm:rounded-[2rem] sm:p-7">
              <p className="mb-4 font-display text-xl font-bold leading-tight tracking-[-0.04em] text-midnight sm:mb-5 sm:text-2xl">Un correo breve cuando encontremos una ruta que realmente convenga.</p>
              <NewsletterForm source="website" />
              <p className="mt-1 text-xs leading-5 text-midnight/55">Sin ruido ni correos diarios. Puedes darte de baja cuando quieras.</p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
