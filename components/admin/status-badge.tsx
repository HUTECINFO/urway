import { clsx } from "clsx";
import { DealStatus } from "@/lib/domain/types";

const labels: Record<DealStatus, string> = {
  [DealStatus.DISCOVERED]: "Detectado",
  [DealStatus.REVIEW]: "En revisión",
  [DealStatus.APPROVED]: "Aprobado",
  [DealStatus.PUBLISHED]: "Publicado",
  [DealStatus.EXPIRED]: "Expirado",
  [DealStatus.REJECTED]: "Rechazado",
};

const styles: Record<DealStatus, string> = {
  [DealStatus.DISCOVERED]: "border-sky/25 bg-sky/10 text-[#1675a8]",
  [DealStatus.REVIEW]: "border-amber-300/60 bg-amber-50 text-amber-700",
  [DealStatus.APPROVED]: "border-emerald/25 bg-emerald/10 text-[#087c51]",
  [DealStatus.PUBLISHED]: "border-midnight/15 bg-midnight text-white",
  [DealStatus.EXPIRED]: "border-slate/20 bg-slate/10 text-slate",
  [DealStatus.REJECTED]: "border-coral/25 bg-coral/10 text-[#b3452f]",
};

export function StatusBadge({ status }: { status: DealStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em]", styles[status])}>
      {labels[status]}
    </span>
  );
}
