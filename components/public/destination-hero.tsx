import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Deal } from "@/lib/domain/types";
import { getCountryImageUrl } from "@/lib/media/country-images";
import { DealBadge } from "./deal-badge";
import { PriceBlock } from "./price-block";

interface DestinationHeroProps {
  deal?: Deal;
  children?: ReactNode;
}

export function DestinationHero({ deal, children }: DestinationHeroProps) {
  return (
    <section id="inicio" className="relative min-h-[100svh] overflow-hidden bg-midnight text-white">
      <Image
        src={deal?.imageUrl ?? getCountryImageUrl("MX")}
        alt={deal ? `Vista de ${deal.destination.city}, ${deal.destination.country}` : "Vista aérea desde la ventana de un avión"}
        fill
        priority
        loading="eager"
        sizes="100vw"
        className="hero-image object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,27,42,.2)_0%,rgba(13,27,42,.18)_30%,rgba(13,27,42,.92)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(255,122,89,.25),transparent_30%)]" />

      <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-8 pt-32 sm:pb-10 sm:pt-36 lg:pb-12">
        <div className="mb-auto flex items-center justify-between gap-4 pt-4">
          <p className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] backdrop-blur-md">Selección desde México</p>
          {deal && <DealBadge type={deal.dealType} />}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">El precio correcto cambia el viaje.</p>
            <h1 className="max-w-5xl text-balance font-display text-[clamp(4rem,11vw,9.5rem)] font-extrabold leading-[0.78] tracking-[-0.085em]">
              Viaja más.<br /><span className="text-coral">Busca menos.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-base leading-7 text-white/72 sm:text-xl sm:leading-8">Detectamos tarifas fuera de lo común, revisamos cada detalle y te mostramos solo lo que sí vale la pena reservar.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/18 bg-white/12 p-4 backdrop-blur-xl sm:p-5">
            {children}
          </div>
        </div>

        {deal && (
          <div className="mt-8 flex flex-col gap-5 border-t border-white/18 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Oportunidad destacada</p><h2 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.055em] sm:text-4xl">{deal.destination.city}</h2></div>
              <PriceBlock price={deal.price} normalPrice={deal.normalPrice} savingsPercentage={deal.savingsPercentage} currency={deal.currency} inverse />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="#drops" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/22 px-5 text-sm font-extrabold text-white transition hover:bg-white hover:text-midnight">Ver la selección <ArrowDown aria-hidden="true" className="size-4" /></Link>
              <Link href={`/drop/${deal.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-coral px-5 text-sm font-extrabold text-midnight transition hover:bg-white">Ver la oportunidad <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          </div>
        )}
        </div>
    </section>
  );
}
