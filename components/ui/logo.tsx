import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";

interface LogoProps {
  inverse?: boolean;
  compact?: boolean;
}

export function Logo({ inverse = false, compact = false }: LogoProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="UR WAY, inicio">
      <span className={clsx(
        "flex size-9 items-center justify-center rounded-full border",
        inverse ? "border-white/25 bg-white/10 text-white" : "border-midnight/15 bg-midnight text-white",
      )}>
        <ArrowUpRight size={17} strokeWidth={2.2} />
      </span>
      <span className={clsx("font-display text-lg font-extrabold tracking-[-0.06em]", inverse ? "text-white" : "text-midnight")}>
        UR WAY
      </span>
      {!compact && <span className={clsx("hidden text-[10px] font-semibold tracking-[0.16em] sm:inline", inverse ? "text-white/45" : "text-slate")}>BY HUTEC</span>}
    </Link>
  );
}
