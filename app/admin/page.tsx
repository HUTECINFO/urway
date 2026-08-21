import { Activity, BadgeDollarSign, BarChart3, BookOpenCheck, Eye, Flame, MousePointerClick, Radio, ScanSearch } from "lucide-react";
import { AdminDealTable } from "@/components/admin/admin-deal-table";
import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { getAdminAnalytics, listAdminDeals } from "@/lib/data/deals";

function RankingCard({ title, eyebrow, items }: { title: string; eyebrow: string; items: Array<{ label: string; value: number }> }) {
  return (
    <article className="rounded-2xl border border-midnight/8 bg-white p-5 sm:p-6">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate">{eyebrow}</p>
      <h3 className="mt-2 font-display text-xl font-extrabold tracking-[-0.04em] text-midnight">{title}</h3>
      <div className="mt-5 space-y-4">
        {items.length ? items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sand text-[10px] font-extrabold text-slate">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3 text-xs"><span className="truncate font-bold text-midnight">{item.label}</span><span className="font-extrabold text-slate">{item.value}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-sky" style={{ width: `${Math.max(8, (item.value / (items[0]?.value || 1)) * 100)}%` }} /></div>
            </div>
          </div>
        )) : <p className="rounded-xl bg-[#f8f7f3] px-4 py-6 text-center text-xs leading-5 text-slate">Aparecerán datos cuando se registren clics.</p>}
      </div>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const [analytics, deals] = await Promise.all([getAdminAnalytics(), listAdminDeals()]);
  const topDeals = analytics.topDeals.map((deal) => ({ label: deal.title, value: deal.clicks }));

  return (
    <div className="mx-auto max-w-[1480px]">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-coral"><span className="size-1.5 rounded-full bg-coral" /> Live desk</div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.055em] text-midnight sm:text-4xl">Pulso de oportunidades</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">La vista editorial de todo lo que detectamos, revisamos y convertimos en viajes que valen la pena.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald/20 bg-emerald/8 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#087c51]"><Radio size={13} /> Sistema operativo</div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas operativas">
        <AdminStatsCard label="Detectados hoy" value={analytics.detectedToday} helper="Nuevos candidatos" icon={ScanSearch} accent="sky" />
        <AdminStatsCard label="En revisión" value={analytics.inReview} helper="Esperan decisión" icon={Activity} accent="coral" />
        <AdminStatsCard label="Publicados" value={analytics.published} helper="Drops activos" icon={BookOpenCheck} accent="emerald" />
        <AdminStatsCard label="Flash Drops" value={analytics.flashDrops} helper="Publicados de alta urgencia" icon={Flame} accent="coral" />
        <AdminStatsCard label="Clics" value={analytics.clicks.toLocaleString("es-MX")} helper="Salidas a proveedor" icon={MousePointerClick} accent="midnight" />
        <AdminStatsCard label="Vistas" value={analytics.views.toLocaleString("es-MX")} helper="Sesiones acumuladas" icon={Eye} accent="sky" />
        <AdminStatsCard label="CTR" value={`${analytics.ctr}%`} helper="Clics sobre vistas" icon={BarChart3} accent="emerald" />
        <AdminStatsCard label="Afiliados / reservas" value="$0 · 0" helper="Integración pendiente" icon={BadgeDollarSign} accent="midnight" placeholder />
      </section>

      <section id="rendimiento" className="mt-8 scroll-mt-32">
        <div className="mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate">Rendimiento</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.045em]">Qué está moviendo a la audiencia</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <RankingCard title="Top destinos" eyebrow="Por clics" items={analytics.topDestinations} />
          <RankingCard title="Top orígenes" eyebrow="Aeropuertos" items={analytics.topAirports} />
          <RankingCard title="Top Drops" eyebrow="Conversión editorial" items={topDeals} />
        </div>
      </section>

      <section id="drops" className="mt-10 scroll-mt-32">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate">Pipeline editorial</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.045em]">Todos los Drops</h2>
          </div>
          <span className="rounded-full border border-midnight/10 bg-white px-3 py-2 text-xs font-bold text-slate">{deals.length} candidatos</span>
        </div>
        <AdminDealTable deals={deals} />
      </section>
    </div>
  );
}
