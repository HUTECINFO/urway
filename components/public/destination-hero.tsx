import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Deal } from "@/lib/domain/types";
import { DealBadge } from "./deal-badge";
import { PriceBlock } from "./price-block";

interface DestinationHeroProps {
  deal?: Deal;
  children?: ReactNode;
}

const fallbackImage = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80";

export function DestinationHero({ deal, children }: DestinationHeroProps) {
  return (
    <section className="overflow-hidden bg-sand">
      <div className="container-page grid min-h-[calc(100svh-4.5rem)] items-stretch gap-8 py-8 md:grid-cols-[0.9fr_1.1fr] md:gap-10 md:py-12 lg:gap-16">
        <div className="flex flex-col justify-center py-5">
          <p className="mb-5 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-coral">
            <span className="h-px w-8 bg-coral" /> Curaduría de viajes desde México
          </p>
          <h1 className="text-balance font-display text-[clamp(3.25rem,10vw,6.8rem)] font-extrabold leading-[0.88] tracking-[-0.075em] text-midnight">
            El mundo,<br /><span className="text-coral">UR WAY.</span>
          </h1>
          <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-slate sm:text-xl">
            Menos ruido, mejores viajes. Encontramos, analizamos y explicamos las tarifas que realmente vale la pena reservar.
          </p>
          <div className="mt-8 max-w-md">{children}</div>
          <Link href="#drops" className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-extrabold text-midnight transition hover:gap-3">
            Explorar Drops de hoy <ArrowDownRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-midnight sm:min-h-[38rem] md:min-h-0">
          <Image
            src={deal?.imageUrl ?? fallbackImage}
            alt={deal ? `Vista de ${deal.destination.city}, ${deal.destination.country}` : "Vista aérea desde la ventana de un avión"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
            {deal ? <DealBadge type={deal.dealType} /> : <span className="rounded-full bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-midnight">Selección editorial</span>}
            <span className="rounded-full bg-midnight/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">Verificado por UR WAY</span>
          </div>
          {deal && (
            <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] bg-midnight/90 p-5 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Drop destacado · {deal.origin.city}</p>
              <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl font-extrabold tracking-[-0.05em]">{deal.destination.city}</h2>
                  <PriceBlock price={deal.price} normalPrice={deal.normalPrice} savingsPercentage={deal.savingsPercentage} currency={deal.currency} inverse />
                </div>
                <Link href={`/drop/${deal.slug}`} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-midnight transition hover:bg-sand">
                  Ver el Drop <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
