import { clsx } from "clsx";
import { DealType } from "@/lib/domain/types";

const labels: Record<DealType, string> = {
  [DealType.TODAY]: "Oportunidad de hoy",
  [DealType.FLASH]: "Tarifa relámpago",
  [DealType.WEEKEND]: "Fin de semana",
  [DealType.LONG_HAUL]: "Larga distancia",
  [DealType.BEACH]: "Sol y playa",
  [DealType.CITY]: "Escapada urbana",
};

const styles: Record<DealType, string> = {
  [DealType.TODAY]: "bg-midnight text-white",
  [DealType.FLASH]: "bg-coral text-midnight",
  [DealType.WEEKEND]: "bg-sand text-midnight",
  [DealType.LONG_HAUL]: "bg-sky text-midnight",
  [DealType.BEACH]: "bg-[#dff4ec] text-[#075d46]",
  [DealType.CITY]: "bg-white text-midnight",
};

interface DealBadgeProps {
  type: DealType;
  className?: string;
}

export function getDealTypeLabel(type: DealType) {
  return labels[type];
}

export function DealBadge({ type, className }: DealBadgeProps) {
  return (
    <span className={clsx("inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] shadow-sm", styles[type], className)}>
      {labels[type]}
    </span>
  );
}
