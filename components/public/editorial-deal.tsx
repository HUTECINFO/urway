import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Plane } from "lucide-react";
import type { Deal } from "@/lib/domain/types";
import { DealBadge } from "./deal-badge";
import { DealScore } from "./deal-score";
import { ExternalBookingButton } from "./external-booking-button";
import { formatDateRange, formatStops } from "./deal-formatters";
import { PriceBlock } from "./price-block";

interface EditorialDealProps {
  deal: Deal;
  index: number;
}

export function EditorialDeal({ deal, index }: EditorialDealProps) {
  const reverse = index % 2 === 1;

  return (
    <article className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-[0_24px_90px_rgba(13,27,42,0.08)] lg:min-h-[38rem] lg:grid-cols-2">
      <div className={`relative min-h-[28rem] overflow-hidden bg-sand ${reverse ? "lg:order-2" : ""}`}>
        <Image
          src={deal.imageUrl}
          alt={`${deal.destination.city}, ${deal.destination.country}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition duration-[1.2s] hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/50 via-transparent to-transparent" />
        <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3 sm:inset-x-7 sm:top-7">
          <span className="font-display text-5xl font-extrabold tracking-[-0.08em] text-white/75">0{index + 1}</span>
          <DealBadge type={deal.dealType} />
        </div>
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
          <DealScore score={deal.score} inverse />
        </div>
      </div>

      <div className={`flex flex-col justify-between p-7 sm:p-10 lg:p-12 ${reverse ? "lg:order-1" : ""}`}>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-coral">{deal.origin.city} <span className="mx-2 text-midnight/25">→</span> {deal.destination.country}</p>
          <h3 className="mt-5 text-balance font-display text-[clamp(3.2rem,7vw,6.5rem)] font-extrabold leading-[0.82] tracking-[-0.08em] text-midnight">{deal.destination.city}</h3>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate">{deal.shortCopy}</p>
          <dl className="mt-8 grid gap-3 border-y border-midnight/8 py-5 text-sm text-slate sm:grid-cols-2">
            <div className="flex items-center gap-2.5"><CalendarDays aria-hidden="true" className="size-4 text-coral" /><dt className="sr-only">Fechas</dt><dd>{formatDateRange(deal)} · {deal.durationDays} días</dd></div>
            <div className="flex items-center gap-2.5"><Plane aria-hidden="true" className="size-4 text-coral" /><dt className="sr-only">Vuelo</dt><dd>{deal.airline} · {formatStops(deal.stops)}</dd></div>
          </dl>
        </div>
        <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <PriceBlock price={deal.price} normalPrice={deal.normalPrice} savingsPercentage={deal.savingsPercentage} currency={deal.currency} />
          <div className="flex flex-wrap gap-2">
            <Link href={`/drop/${deal.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-midnight/12 px-4 text-sm font-extrabold text-midnight transition hover:border-midnight hover:bg-midnight hover:text-white">Ver detalles <ArrowRight aria-hidden="true" className="size-4" /></Link>
            <ExternalBookingButton dealId={deal.id} placement="hero" className="rounded-2xl" />
          </div>
        </div>
      </div>
    </article>
  );
}
