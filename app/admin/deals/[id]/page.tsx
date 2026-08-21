import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Fingerprint, ImageIcon, MapPin, Plane, Timer, WalletCards } from "lucide-react";
import { DealActions } from "@/components/admin/deal-actions";
import { DealEditor } from "@/components/admin/deal-editor";
import { ScoreBreakdown } from "@/components/admin/score-breakdown";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDealById } from "@/lib/data/deals";
import { TripType } from "@/lib/domain/types";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" });

function timestamp(value?: string) {
  return value ? dateTime.format(new Date(value)) : "Sin registro";
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-midnight/6 py-3 last:border-0">
      <dt className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-5 text-midnight">{value}</dd>
    </div>
  );
}

export default async function AdminDealReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDealById(id, true);
  if (!deal) notFound();

  const highlights = [
    { icon: MapPin, label: "Destino", value: `${deal.destination.city}, ${deal.destination.country}` },
    { icon: WalletCards, label: "Precio", value: money.format(deal.price) },
    { icon: CalendarDays, label: "Salida", value: date.format(new Date(deal.departureDate)) },
    { icon: Plane, label: "Vuelo", value: deal.stops === 0 ? "Directo" : `${deal.stops} escala${deal.stops > 1 ? "s" : ""}` },
  ];

  return (
    <div className="mx-auto max-w-[1380px]">
      <Link href="/admin#drops" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate transition hover:text-midnight"><ArrowLeft size={15} /> Volver a todos los Drops</Link>

      <section className="mb-6 rounded-3xl bg-midnight p-5 text-white sm:p-7 lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2"><StatusBadge status={deal.status} /><span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white/60">{deal.dealType.replaceAll("_", " ")}</span></div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky">Revisión editorial</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] sm:text-4xl">{deal.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{deal.shortCopy}</p>
        </div>
        <div className="mt-6 lg:mt-0"><DealActions id={deal.id} status={deal.status} includeView={false} /></div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-midnight/8 bg-white">
            <div className="relative min-h-64 bg-sand sm:min-h-80">
              <Image src={deal.imageUrl} alt={`Vista de ${deal.destination.city}`} fill sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-midnight/75" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
                <div><p className="text-xs font-bold text-white/65">{deal.origin.city} → {deal.destination.city}</p><p className="mt-1 font-display text-2xl font-extrabold tracking-[-0.045em]">{deal.origin.code} — {deal.destination.code}</p></div>
                <a href={deal.imageUrl} target="_blank" rel="noreferrer" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10" aria-label="Abrir imagen"><ImageIcon size={17} /></a>
              </div>
            </div>
            <div className="grid gap-px bg-midnight/6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white p-5"><Icon className="mb-3 text-sky" size={17} /><p className="text-[9px] font-extrabold uppercase tracking-wider text-slate">{label}</p><p className="mt-1 text-sm font-extrabold text-midnight">{value}</p></div>
              ))}
            </div>
          </section>

          <DealEditor deal={deal} />

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-midnight/8 bg-white p-5 sm:p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-coral">Datos originales</p>
              <h2 className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em]">Fuente y proveedor</h2>
              <dl className="mt-4">
                <Detail label="Proveedor" value={deal.provider} />
                <Detail label="Referencia del proveedor" value={deal.providerDealId} />
                <Detail label="URL original" value={<a href={deal.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 break-all text-[#1675a8] hover:underline">{deal.bookingUrl}<ExternalLink className="shrink-0" size={12} /></a>} />
                <Detail label="Fingerprint" value={<span className="inline-flex items-start gap-2 font-mono text-xs"><Fingerprint className="mt-0.5 shrink-0 text-slate" size={14} />{deal.fingerprint}</span>} />
                <Detail label="Imagen original" value={<a href={deal.imageUrl} target="_blank" rel="noreferrer" className="break-all text-[#1675a8] hover:underline">{deal.imageUrl}</a>} />
              </dl>
            </article>

            <article className="rounded-2xl border border-midnight/8 bg-white p-5 sm:p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky">Detalle completo</p>
              <h2 className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em]">Vuelo normalizado</h2>
              <dl className="mt-4">
                <Detail label="Origen" value={`${deal.origin.name} · ${deal.origin.city}, ${deal.origin.country} (${deal.origin.code})`} />
                <Detail label="Destino" value={`${deal.destination.name} · ${deal.destination.city}, ${deal.destination.country} (${deal.destination.code})`} />
                <Detail label="Viaje" value={deal.tripType === TripType.ROUND_TRIP ? "Ida y vuelta" : "Solo ida"} />
                <Detail label="Ventana de salida" value={`${date.format(new Date(deal.dateWindow.start))} — ${date.format(new Date(deal.dateWindow.end))}${deal.dateWindow.flexible ? " · Flexible" : ""}`} />
                <Detail label="Regreso" value={deal.returnDate ? date.format(new Date(deal.returnDate)) : "No aplica"} />
                <Detail label="Aerolínea / vuelo" value={`${deal.airline}${deal.flightNumber ? ` · ${deal.flightNumber}` : ""}`} />
                <Detail label="Duración" value={`${deal.durationDays} días · ${Math.floor(deal.durationMinutes / 60)} h ${deal.durationMinutes % 60} min`} />
                <Detail label="Cabina / equipaje" value={`${deal.cabinClass ?? "Sin especificar"} · ${deal.baggage}`} />
                <Detail label="Escalas / nocturno" value={`${deal.stops} · ${deal.overnight ? "Sí" : "No"}`} />
                <Detail label="Tags" value={deal.tags.join(" · ")} />
              </dl>
            </article>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-28">
          <ScoreBreakdown score={deal.score} />
          <section className="rounded-2xl border border-midnight/8 bg-white p-5">
            <div className="mb-4 flex items-center gap-2"><Timer className="text-slate" size={16} /><h2 className="text-sm font-extrabold">Línea de tiempo</h2></div>
            <dl>
              <Detail label="Detectado" value={timestamp(deal.detectedAt)} />
              <Detail label="Descubierto" value={timestamp(deal.discoveredAt)} />
              <Detail label="Verificado" value={timestamp(deal.verifiedAt)} />
              <Detail label="Publicado" value={timestamp(deal.publishedAt)} />
              <Detail label="Expira / expiró" value={timestamp(deal.expiresAt)} />
              <Detail label="Creado" value={timestamp(deal.createdAt)} />
              <Detail label="Última actualización" value={timestamp(deal.updatedAt)} />
            </dl>
          </section>
          <section className="rounded-2xl border border-midnight/8 bg-white p-5">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate">Economía del Drop</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-sand/55 p-3"><p className="text-[9px] font-bold uppercase text-slate">Normal</p><p className="mt-1 text-sm font-extrabold line-through decoration-coral">{money.format(deal.normalPrice)}</p></div>
              <div className="rounded-xl bg-emerald/8 p-3"><p className="text-[9px] font-bold uppercase text-[#087c51]">Ahorro</p><p className="mt-1 text-sm font-extrabold text-[#087c51]">{money.format(deal.savings)} · {deal.savingsPercentage}%</p></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
