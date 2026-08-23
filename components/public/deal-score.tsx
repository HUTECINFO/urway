import { clsx } from "clsx";
import type { DealScore as DealScoreValue } from "@/lib/domain/types";

interface DealScoreProps {
  score: DealScoreValue;
  compact?: boolean;
  inverse?: boolean;
}

function getPublicScoreLabel(total: number) {
  if (total >= 90) return "Excepcional";
  if (total >= 80) return "Muy buena";
  if (total >= 70) return "Buena oportunidad";
  return "Tarifa analizada";
}

export function DealScore({ score, compact = false, inverse = false }: DealScoreProps) {
  const publicLabel = getPublicScoreLabel(score.total);

  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full border font-semibold",
        compact ? "gap-1.5 px-2.5 py-1 text-xs" : "gap-2.5 px-3 py-2 text-sm",
        inverse ? "border-white/20 bg-midnight/65 text-white backdrop-blur-md" : "border-midnight/10 bg-white text-midnight",
      )}
      aria-label={`Calificación UR WAY: ${score.total} de 100, ${publicLabel}`}
    >
      <span
        className={clsx(
          "flex items-center justify-center rounded-full font-extrabold text-midnight",
          score.total >= 80 ? "bg-emerald" : score.total >= 70 ? "bg-sky" : "bg-sand",
          compact ? "size-6 text-[10px]" : "size-8 text-xs",
        )}
      >
        {score.total}
      </span>
      <span>{publicLabel}</span>
    </div>
  );
}
