import { ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";

interface ExternalBookingButtonProps {
  dealId: string;
  placement?: "card" | "detail" | "hero";
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
}

export function ExternalBookingButton({
  dealId,
  placement = "detail",
  className,
  compact = false,
  tone = "dark",
}: ExternalBookingButtonProps) {
  const href = `/go/${encodeURIComponent(dealId)}?source=urway-public&placement=${placement}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition hover:-translate-y-0.5",
        tone === "light"
          ? "bg-white text-midnight hover:bg-sand"
          : "bg-midnight text-white hover:bg-midnight/90",
        compact ? "px-4 py-2.5 text-xs" : "min-h-13 px-6 py-3.5 text-sm",
        className,
      )}
      aria-label="Abrir esta tarifa con el proveedor en una nueva pestaña"
    >
      Ir a la tarifa
      <ArrowUpRight aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
    </a>
  );
}
