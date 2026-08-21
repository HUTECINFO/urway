import type { Deal } from "@/lib/domain/types";
import { DealActions } from "@/components/admin/deal-actions";
import { StatusBadge } from "@/components/admin/status-badge";

const typeLabels: Record<Deal["dealType"], string> = {
  TODAY: "Hoy",
  FLASH: "Flash",
  WEEKEND: "Fin de semana",
  LONG_HAUL: "Larga distancia",
  BEACH: "Playa",
  CITY: "Ciudad",
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

function formatDate(value: string) {
  return date.format(new Date(value));
}

export function AdminDealTable({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-midnight/15 bg-white px-6 py-16 text-center">
        <p className="font-display text-xl font-extrabold tracking-[-0.04em]">Todavía no hay Drops</p>
        <p className="mt-2 text-sm text-slate">Los candidatos detectados aparecerán aquí para su revisión.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden overflow-x-auto rounded-2xl border border-midnight/8 bg-white md:block">
        <table className="w-full min-w-[1060px] border-collapse text-left">
          <thead>
            <tr className="border-b border-midnight/8 bg-[#fbfaf7] text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate">
              <th className="px-5 py-4">Drop</th>
              <th className="px-4 py-4">Ruta</th>
              <th className="px-4 py-4">Precio</th>
              <th className="px-4 py-4">Tipo</th>
              <th className="px-4 py-4">Score</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Detectado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/6">
            {deals.map((deal) => (
              <tr key={deal.id} className="group align-middle transition hover:bg-sky/[0.035]">
                <td className="max-w-64 px-5 py-4">
                  <p className="truncate text-sm font-bold text-midnight">{deal.title}</p>
                  <p className="mt-1 truncate text-[11px] text-slate">{deal.provider} · {deal.providerDealId}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs font-extrabold text-midnight">{deal.origin.code} → {deal.destination.code}</p>
                  <p className="mt-1 text-[11px] text-slate">{deal.destination.city}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-extrabold text-midnight">{money.format(deal.price)}</p>
                  <p className="mt-1 text-[11px] text-emerald">-{deal.savingsPercentage}%</p>
                </td>
                <td className="px-4 py-4 text-xs font-semibold text-slate">{typeLabels[deal.dealType]}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-full border-4 border-sky/20 bg-sky/8 text-xs font-extrabold text-midnight">{deal.score.total}</span>
                </td>
                <td className="px-4 py-4"><StatusBadge status={deal.status} /></td>
                <td className="px-4 py-4 text-xs text-slate">{formatDate(deal.detectedAt)}</td>
                <td className="px-5 py-4"><DealActions id={deal.id} status={deal.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {deals.map((deal) => (
          <article key={deal.id} className="rounded-2xl border border-midnight/8 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <StatusBadge status={deal.status} />
                <h3 className="mt-3 text-sm font-extrabold leading-5 text-midnight">{deal.title}</h3>
                <p className="mt-1 text-xs text-slate">{deal.origin.code} → {deal.destination.code} · {deal.destination.city}</p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-midnight text-sm font-extrabold text-white">{deal.score.total}</span>
            </div>
            <div className="my-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f8f7f3] p-3">
              <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate">Precio</p><p className="mt-1 text-xs font-extrabold">{money.format(deal.price)}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate">Ahorro</p><p className="mt-1 text-xs font-extrabold text-emerald">{deal.savingsPercentage}%</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate">Detectado</p><p className="mt-1 text-xs font-extrabold">{formatDate(deal.detectedAt)}</p></div>
            </div>
            <DealActions id={deal.id} status={deal.status} />
          </article>
        ))}
      </div>
    </div>
  );
}
