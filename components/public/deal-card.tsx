import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Plane } from "lucide-react";
import type { Deal } from "@/lib/domain/types";
import { DealBadge } from "./deal-badge";
import { DealScore } from "./deal-score";
import { PriceBlock } from "./price-block";
import { ExternalBookingButton } from "./external-booking-button";
import { formatDateRange, formatStops } from "./deal-formatters";

interface DealCardProps {
  deal: Deal;
  priority?: boolean;
}

export function DealCard({ deal, priority = false }: DealCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-midnight/8 bg-white card-shadow">
      <Link href={`/drop/${deal.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand" aria-label={`Ver detalles de ${deal.title}`}>
        <Image
          src={deal.imageUrl}
          alt={`${deal.destination.city}, ${deal.destination.country}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <DealBadge type={deal.dealType} />
          <DealScore score={deal.score} compact inverse />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate">
          <MapPin aria-hidden="true" className="size-3.5 text-coral" />
          {deal.origin.code} <span aria-hidden="true">→</span> {deal.destination.code}
        </div>
        <h3 className="mt-3 font-display text-xl font-extrabold leading-tight tracking-[-0.04em] text-midnight">
          <Link href={`/drop/${deal.slug}`} className="transition hover:text-coral">{deal.destination.city}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate">{deal.shortCopy}</p>
        <dl className="mt-4 grid gap-2 border-y border-midnight/8 py-3 text-xs text-slate">
          <div className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 text-midnight/55" />
            <dt className="sr-only">Fechas</dt>
            <dd>{formatDateRange(deal)} · {deal.durationDays} días</dd>
          </div>
          <div className="flex items-center gap-2">
            <Plane aria-hidden="true" className="size-4 text-midnight/55" />
            <dt className="sr-only">Vuelo</dt>
            <dd>{deal.airline} · {formatStops(deal.stops)}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-col items-stretch gap-4 pt-5 min-[380px]:flex-row min-[380px]:items-end min-[380px]:justify-between min-[380px]:gap-3">
          <PriceBlock price={deal.price} normalPrice={deal.normalPrice} savingsPercentage={deal.savingsPercentage} currency={deal.currency} />
          <ExternalBookingButton dealId={deal.id} placement="card" compact className="shrink-0" />
        </div>
      </div>
    </article>
  );
}
