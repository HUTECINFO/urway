"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MapPin } from "lucide-react";
import type { Airport } from "@/lib/domain/types";

interface AirportSelectorProps {
  airports: readonly Airport[];
  selected?: string;
  className?: string;
}

export function AirportSelector({ airports, selected = "", className = "" }: AirportSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateOrigin(origin: string) {
    const url = new URL(window.location.href);
    if (origin) url.searchParams.set("origen", origin);
    else url.searchParams.delete("origen");
    url.hash = "drops";
    startTransition(() => router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: true }));
  }

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="origin-airport" className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-midnight/65">
        Tu aeropuerto de salida
      </label>
      <div className="relative">
        <MapPin aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-coral" />
        <select
          id="origin-airport"
          value={selected}
          onChange={(event) => updateOrigin(event.target.value)}
          disabled={isPending}
          className="h-14 w-full appearance-none rounded-2xl border border-midnight/12 bg-white pl-12 pr-11 text-sm font-bold text-midnight shadow-[0_10px_30px_rgba(13,27,42,0.08)] transition hover:border-midnight/25 disabled:cursor-wait disabled:opacity-70"
          aria-describedby="origin-help"
        >
          <option value="">Todos los aeropuertos</option>
          {airports.map((airport) => (
            <option value={airport.code} key={airport.code}>
              {airport.city} · {airport.code}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate">▼</span>
      </div>
      <p id="origin-help" className="mt-2 text-xs text-slate" aria-live="polite">
        {isPending ? "Buscando Drops…" : "Te mostramos tarifas que salen cerca de ti."}
      </p>
    </div>
  );
}
