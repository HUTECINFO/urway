import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

interface LogoProps {
  inverse?: boolean;
  compact?: boolean;
  href?: string;
  label?: string;
}

export function Logo({ inverse = false, compact = false, href = "/", label = "UR WAY, inicio" }: LogoProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label={label}>
      <span className={clsx(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[0.9rem] transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105",
        inverse ? "bg-white" : "bg-sand",
      )}>
        <Image src="/brand/urway-mark.png" alt="" width={40} height={40} className="size-9 object-contain" priority />
      </span>
      <span className="leading-none">
        <span className={clsx("block font-display text-lg font-extrabold tracking-[-0.065em]", inverse ? "text-white" : "text-midnight")}>
          UR WAY
        </span>
        {!compact && <span className={clsx("mt-1 hidden text-[8px] font-bold tracking-[0.22em] sm:block", inverse ? "text-white/45" : "text-slate")}>TRAVEL DROPS</span>}
      </span>
    </Link>
  );
}
