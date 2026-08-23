import { clsx } from "clsx";
import { formatMoney } from "./deal-formatters";

interface PriceBlockProps {
  price: number;
  normalPrice: number;
  savingsPercentage: number;
  currency?: string;
  inverse?: boolean;
  large?: boolean;
}

export function PriceBlock({
  price,
  normalPrice,
  savingsPercentage,
  currency = "MXN",
  inverse = false,
  large = false,
}: PriceBlockProps) {
  const hasRealSavings = normalPrice > price && savingsPercentage > 0;

  return (
    <div>
      <p className={clsx("text-xs font-semibold uppercase tracking-[0.12em]", inverse ? "text-white/65" : "text-slate")}>Desde · viaje redondo</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <strong className={clsx("font-display font-extrabold tracking-[-0.055em]", large ? "text-4xl sm:text-5xl" : "text-3xl", inverse ? "text-white" : "text-midnight")}>
          {formatMoney(price, currency)}
        </strong>
        <span className={clsx("text-xs font-bold", inverse ? "text-white/60" : "text-slate")}>{currency}</span>
      </div>
      {hasRealSavings && (
        <div className={clsx("mt-1.5 flex items-center gap-2 text-xs", inverse ? "text-white/65" : "text-slate")}>
          <span className="line-through">Regular {formatMoney(normalPrice, currency)}</span>
          <span className={clsx("rounded-full px-2 py-1 font-extrabold", inverse ? "bg-emerald text-midnight" : "bg-[#dff4ec] text-[#075d46]")}>
            −{Math.round(savingsPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
