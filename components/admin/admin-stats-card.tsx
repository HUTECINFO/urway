import type { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  accent?: "sky" | "coral" | "emerald" | "midnight";
  placeholder?: boolean;
}

const accents = {
  sky: "bg-sky/12 text-[#1675a8]",
  coral: "bg-coral/12 text-[#b3452f]",
  emerald: "bg-emerald/12 text-[#087c51]",
  midnight: "bg-midnight text-white",
};

export function AdminStatsCard({ label, value, helper, icon: Icon, accent = "sky", placeholder = false }: AdminStatsCardProps) {
  return (
    <article className="rounded-2xl border border-midnight/8 bg-white p-5 shadow-[0_8px_30px_rgba(13,27,42,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate">{label}</p>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] text-midnight">{value}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-xl ${accents[accent]}`}><Icon size={18} /></span>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-midnight/6 pt-3">
        {placeholder ? <span className="rounded-full bg-sand px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate">Próximamente</span> : null}
        <p className="text-xs text-slate">{helper}</p>
      </div>
    </article>
  );
}
