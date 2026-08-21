import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock3, Info, Luggage, Plane, Route, ShieldCheck, Ticket, Users } from "lucide-react";
import { DealBadge } from "@/components/public/deal-badge";
import { DealScore } from "@/components/public/deal-score";
import { DealViewTracker } from "@/components/public/deal-view-tracker";
import { ExternalBookingButton } from "@/components/public/external-booking-button";
import { formatDuration, formatLongDate, formatMoney, formatStops } from "@/components/public/deal-formatters";
import { PriceBlock } from "@/components/public/price-block";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getDealBySlug } from "@/lib/data/deals";
import { TripType } from "@/lib/domain/types";

interface DropPageProps {
  params: Promise<{ slug: string }>;
}

const dateTime = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) {
    return { title: "Drop no encontrado", robots: { index: false, follow: false } };
  }

  const title = `${deal.destination.city} desde ${formatMoney(deal.price, deal.currency)}`;
  const description = `${deal.shortCopy} ${deal.origin.code} a ${deal.destination.code}, ${formatStops(deal.stops).toLowerCase()}. Tarifa verificada por UR WAY.`;
  const canonical = `/drop/${deal.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "es_MX",
      url: canonical,
      title,
      description,
      publishedTime: deal.publishedAt,
      modifiedTime: deal.updatedAt,
      images: [{ url: deal.imageUrl, width: 1600, height: 1067, alt: `${deal.destination.city}, ${deal.destination.country}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [deal.imageUrl],
    },
  };
}

export default async function DropPage({ params }: DropPageProps) {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) notFound();

  const scoreItems = [
    ["Precio", deal.score.breakdown.price],
    ["Ahorro", deal.score.breakdown.savings],
    ["Destino", deal.score.breakdown.destination],
    ["Fechas", deal.score.breakdown.date],
    ["Calidad de vuelo", deal.score.breakdown.flightQuality],
  ] as const;

  const detailItems = [
    { icon: CalendarDays, label: "Viaje", value: `${formatLongDate(deal.travelStartDate)} — ${formatLongDate(deal.travelEndDate)}` },
    { icon: Clock3, label: "Duración del viaje", value: `${deal.durationDays} días` },
    { icon: Plane, label: "Vuelo", value: `${deal.airline}${deal.flightNumber ? ` · ${deal.flightNumber}` : ""}` },
    { icon: Route, label: "Trayecto", value: `${formatStops(deal.stops)} · ${formatDuration(deal.durationMinutes)}` },
    { icon: Luggage, label: "Equipaje incluido", value: deal.baggage },
    { icon: Users, label: "Cabina", value: deal.cabinClass ? deal.cabinClass.toLocaleLowerCase("es-MX") : "Económica" },
  ];

  return (
    <>
      <PublicHeader />
      <main>
        <DealViewTracker dealId={deal.id} />
        <section className="bg-sand pb-10 pt-6 sm:pb-16 sm:pt-10">
          <div className="container-page">
            <Link href="/#drops" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate transition hover:text-midnight">
              <ArrowLeft aria-hidden="true" className="size-4" /> Volver a los Drops
            </Link>
            <div className="grid overflow-hidden rounded-[2rem] bg-midnight lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[23rem] sm:min-h-[32rem] lg:min-h-[41rem]">
                <Image
                  src={deal.imageUrl}
                  alt={`Vista de ${deal.destination.city}, ${deal.destination.country}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
                <div className="absolute left-5 top-5 sm:left-7 sm:top-7"><DealBadge type={deal.dealType} /></div>
              </div>
              <div className="flex flex-col justify-center p-6 text-white sm:p-10 lg:p-12">
                <div className="flex flex-wrap items-center gap-3">
                  <DealScore score={deal.score} inverse />
                  <span className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-white/65">Actualizado {dateTime.format(new Date(deal.verifiedAt))}</span>
                </div>
                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-coral">{deal.origin.city} · {deal.origin.code} <span aria-hidden="true">→</span> {deal.destination.code}</p>
                <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.065em] sm:text-6xl">{deal.title}</h1>
                <p className="mt-5 text-lg leading-8 text-white/65">{deal.shortCopy}</p>
                <div className="mt-8 border-t border-white/12 pt-7">
                  <PriceBlock price={deal.price} normalPrice={deal.normalPrice} savingsPercentage={deal.savingsPercentage} currency={deal.currency} inverse large />
                  <ExternalBookingButton dealId={deal.id} placement="hero" className="mt-6 w-full bg-white text-midnight hover:bg-sand sm:w-auto" />
                  <p className="mt-3 text-xs leading-5 text-white/45">El precio se confirma en el sitio del proveedor. Abriremos una nueva pestaña.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="container-page grid gap-12 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-16">
            <div>
              <section aria-labelledby="about-title">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">El veredicto UR WAY</p>
                <h2 id="about-title" className="mt-2 font-display text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">Por qué es un buen Drop</h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate">{deal.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {deal.tags.map((tag) => <span key={tag} className="rounded-full bg-sand px-3 py-2 text-xs font-bold text-midnight">{tag}</span>)}
                </div>
              </section>

              <section className="mt-14" aria-labelledby="details-title">
                <div className="flex items-end justify-between gap-4 border-b border-midnight/10 pb-5">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Itinerario</p>
                    <h2 id="details-title" className="mt-2 font-display text-3xl font-extrabold tracking-[-0.05em]">Los detalles</h2>
                  </div>
                  <span className="hidden text-sm font-bold text-slate sm:block">{deal.tripType === TripType.ROUND_TRIP ? "Viaje redondo" : "Solo ida"}</span>
                </div>
                <dl className="divide-y divide-midnight/8">
                  {detailItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="grid gap-3 py-5 sm:grid-cols-[13rem_1fr]">
                      <dt className="flex items-center gap-2 text-sm font-extrabold text-midnight"><Icon aria-hidden="true" className="size-4 text-coral" /> {label}</dt>
                      <dd className="text-sm leading-6 text-slate">{value}</dd>
                    </div>
                  ))}
                  <div className="grid gap-3 py-5 sm:grid-cols-[13rem_1fr]">
                    <dt className="flex items-center gap-2 text-sm font-extrabold text-midnight"><Ticket aria-hidden="true" className="size-4 text-coral" /> Ventana de fechas</dt>
                    <dd className="text-sm leading-6 text-slate">Del {formatLongDate(deal.dateWindow.start)} al {formatLongDate(deal.dateWindow.end)}{deal.dateWindow.flexible ? ". Fechas flexibles." : ". Fechas fijas."}</dd>
                  </div>
                </dl>
              </section>

              <section className="mt-14 rounded-[2rem] bg-sand p-6 sm:p-9" aria-labelledby="score-title">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Más que un precio bajo</p>
                    <h2 id="score-title" className="mt-2 font-display text-3xl font-extrabold tracking-[-0.05em]">Score UR WAY</h2>
                  </div>
                  <DealScore score={deal.score} />
                </div>
                <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                  {scoreItems.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <dt className="text-sm font-semibold text-slate">{label}</dt>
                      <dd className="font-display text-lg font-extrabold text-midnight">{value} pts</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <aside className="mt-10 flex gap-4 rounded-2xl border border-midnight/10 p-5" aria-label="Aviso importante">
                <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-coral" />
                <div>
                  <h2 className="text-sm font-extrabold text-midnight">Antes de reservar</h2>
                  <p className="mt-2 text-sm leading-6 text-slate">UR WAY no vende ni emite boletos. La tarifa fue verificada al momento indicado, pero puede cambiar o agotarse sin aviso. Confirma precio final, fechas, equipaje, escalas, requisitos migratorios y políticas directamente con el proveedor antes de pagar.</p>
                </div>
              </aside>
            </div>

            <aside className="rounded-[2rem] border border-midnight/8 bg-white p-6 card-shadow lg:sticky lg:top-24" aria-label="Resumen de reserva">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">Ahorro estimado</p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.05em] text-midnight">{formatMoney(deal.savings, deal.currency)}</p>
              <p className="mt-1 text-sm text-slate">frente al precio habitual de {formatMoney(deal.normalPrice, deal.currency)}</p>
              <div className="my-6 h-px bg-midnight/8" />
              <ul className="space-y-3 text-sm text-slate">
                <li className="flex gap-2"><Check aria-hidden="true" className="size-4 shrink-0 text-emerald" /> Precio por persona</li>
                <li className="flex gap-2"><Check aria-hidden="true" className="size-4 shrink-0 text-emerald" /> {deal.tripType === TripType.ROUND_TRIP ? "Viaje redondo" : "Solo ida"}</li>
                <li className="flex gap-2"><Check aria-hidden="true" className="size-4 shrink-0 text-emerald" /> Impuestos según proveedor</li>
              </ul>
              <ExternalBookingButton dealId={deal.id} placement="detail" className="mt-6 w-full" />
              <div className="mt-5 flex gap-2 text-xs leading-5 text-slate">
                <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-emerald" /> Detectado el {dateTime.format(new Date(deal.detectedAt))} y verificado el {dateTime.format(new Date(deal.verifiedAt))} con {deal.provider}.
              </div>
              {deal.expiresAt && <p className="mt-3 text-xs leading-5 text-slate">Vigencia estimada hasta el {formatLongDate(deal.expiresAt)}, sujeta a disponibilidad.</p>}
            </aside>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
