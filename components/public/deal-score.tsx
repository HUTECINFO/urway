import { clsx } from "clsx";
import type { DealScore as DealScoreValue } from "@/lib/domain/types";

interface DealScoreProps {
  score: DealScoreValue;
  compact?: boolean;
  inverse?: boolean;
}

export function DealScore({ score, compact = false, inverse = false }: DealScoreProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full border font-semibold",
        compact ? "gap-1.5 px-2.5 py-1 text-xs" : "gap-2.5 px-3 py-2 text-sm",
        inverse ? "border-white/20 bg-midnight/65 text-white backdrop-blur-md" : "border-midnight/10 bg-white text-midnight",
      )}
      aria-label={`Calificación UR WAY: ${score.total} de 100, ${score.label}`}
    >
      <span className={clsx("flex items-center justify-center rounded-full bg-emerald font-extrabold text-midnight", compact ? "size-6 text-[10px]" : "size-8 text-xs")}>
        {score.total}
      </span>
      <span>{score.label}</span>
    </div>
  );
}
