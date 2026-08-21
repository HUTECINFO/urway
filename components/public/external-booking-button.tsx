import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";

interface ExternalBookingButtonProps {
  dealId: string;
  placement?: "card" | "detail" | "hero";
  className?: string;
  compact?: boolean;
}

export function ExternalBookingButton({ dealId, placement = "detail", className, compact = false }: ExternalBookingButtonProps) {
  const href = `/go/${encodeURIComponent(dealId)}?source=urway-public&placement=${placement}`;
  return (
    <Link
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full bg-midnight font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-midnight/90",
        compact ? "px-4 py-2.5 text-xs" : "min-h-13 px-6 py-3.5 text-sm",
        className,
      )}
      aria-label="Ver esta tarifa con el proveedor en una nueva pestaña"
    >
      Ver oferta
      <ArrowUpRight aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
    </Link>
  );
}
