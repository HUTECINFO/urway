import type { DealScore } from "@/lib/domain/types";

const scoreLabels = {
  price: "Precio",
  savings: "Ahorro",
  destination: "Destino",
  date: "Fechas",
  flightQuality: "Calidad de vuelo",
};

export function ScoreBreakdown({ score }: { score: DealScore }) {
  const rows = Object.entries(score.breakdown) as Array<[keyof typeof score.breakdown, number]>;

  return (
    <section className="rounded-2xl border border-midnight/8 bg-white p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate">Score editorial</p>
          <p className="mt-2 font-display text-xl font-extrabold tracking-[-0.04em] text-midnight">{score.label}</p>
        </div>
        <div className="text-right">
          <span className="font-display text-4xl font-extrabold tracking-[-0.06em] text-midnight">{score.total}</span>
          <span className="text-sm font-bold text-slate">/100</span>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map(([key, value]) => (
          <div key={key}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-semibold text-slate">{scoreLabels[key]}</span>
              <span className="font-extrabold text-midnight">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-gradient-to-r from-sky to-emerald transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
