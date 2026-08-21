"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, Save, TriangleAlert } from "lucide-react";
import { updateAdminDealAction, type AdminDealActionState } from "@/app/actions/deals";
import { DealType, type Deal } from "@/lib/domain/types";

const initialState: AdminDealActionState = {};
const inputClass = "h-11 w-full rounded-xl border border-midnight/10 bg-white px-3.5 text-sm text-midnight transition placeholder:text-slate/55 hover:border-midnight/20 focus:border-sky";
const labelClass = "mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate";

const typeLabels: Record<DealType, string> = {
  [DealType.TODAY]: "Hoy",
  [DealType.FLASH]: "Flash",
  [DealType.WEEKEND]: "Fin de semana",
  [DealType.LONG_HAUL]: "Larga distancia",
  [DealType.BEACH]: "Playa",
  [DealType.CITY]: "Ciudad",
};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="mt-1.5 text-xs font-semibold text-[#b3452f]">{errors[0]}</p> : null;
}

export function DealEditor({ deal }: { deal: Deal }) {
  const [state, action, pending] = useActionState(updateAdminDealAction, initialState);

  return (
    <form action={action} className="rounded-2xl border border-midnight/8 bg-white">
      <input type="hidden" name="id" value={deal.id} />
      <div className="flex flex-col justify-between gap-3 border-b border-midnight/8 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-coral">Edición manual</p>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em]">Datos normalizados</h2>
        </div>
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-midnight px-5 text-sm font-bold text-white transition hover:bg-midnight/90 disabled:cursor-wait disabled:opacity-60">
          {pending ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}{pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {state.message ? (
        <div role={state.status === "error" ? "alert" : "status"} className={`mx-5 mt-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold sm:mx-6 ${state.status === "success" ? "border-emerald/25 bg-emerald/8 text-[#087c51]" : "border-coral/25 bg-coral/8 text-[#b3452f]"}`}>
          {state.status === "success" ? <CheckCircle2 className="mt-0.5 shrink-0" size={16} /> : <TriangleAlert className="mt-0.5 shrink-0" size={16} />}{state.message}
        </div>
      ) : null}

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>Título</label>
          <input id="title" name="title" defaultValue={deal.title} required maxLength={140} className={inputClass} />
          <FieldError errors={state.errors?.title} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>Descripción</label>
          <textarea id="description" name="description" defaultValue={deal.description} required maxLength={1200} rows={5} className="w-full resize-y rounded-xl border border-midnight/10 bg-white px-3.5 py-3 text-sm leading-6 text-midnight transition hover:border-midnight/20 focus:border-sky" />
          <FieldError errors={state.errors?.description} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="shortCopy" className={labelClass}>Copy corto</label>
          <textarea id="shortCopy" name="shortCopy" defaultValue={deal.shortCopy} required maxLength={180} rows={3} className="w-full resize-y rounded-xl border border-midnight/10 bg-white px-3.5 py-3 text-sm leading-6 text-midnight transition hover:border-midnight/20 focus:border-sky" />
          <FieldError errors={state.errors?.shortCopy} />
        </div>
        <div>
          <label htmlFor="dealType" className={labelClass}>Tipo</label>
          <select id="dealType" name="dealType" defaultValue={deal.dealType} className={inputClass}>
            {Object.values(DealType).map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}
          </select>
          <FieldError errors={state.errors?.dealType} />
        </div>
        <div>
          <label htmlFor="destinationDisplay" className={labelClass}>Destino</label>
          <input id="destinationDisplay" value={`${deal.destination.city}, ${deal.destination.country} (${deal.destination.code})`} disabled className={`${inputClass} cursor-not-allowed bg-sand/45 text-slate`} />
          <p className="mt-1.5 text-[11px] text-slate">Vinculado al aeropuerto normalizado.</p>
        </div>
        <div>
          <label htmlFor="price" className={labelClass}>Precio actual</label>
          <input id="price" name="price" type="number" min="0.01" max="10000000" step="0.01" defaultValue={deal.price} required className={inputClass} />
          <FieldError errors={state.errors?.price} />
        </div>
        <div>
          <label htmlFor="normalPrice" className={labelClass}>Precio normal</label>
          <input id="normalPrice" name="normalPrice" type="number" min="0.01" max="10000000" step="0.01" defaultValue={deal.normalPrice} required className={inputClass} />
          <FieldError errors={state.errors?.normalPrice} />
        </div>
        <div>
          <label htmlFor="savingsPercentage" className={labelClass}>Ahorro (%)</label>
          <input id="savingsPercentage" name="savingsPercentage" type="number" min="0" max="100" step="0.1" defaultValue={deal.savingsPercentage} required className={inputClass} />
          <FieldError errors={state.errors?.savingsPercentage} />
        </div>
        <div>
          <label htmlFor="slug" className={labelClass}>Slug</label>
          <input id="slug" name="slug" defaultValue={deal.slug} required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} />
          <FieldError errors={state.errors?.slug} />
        </div>
        <div>
          <label htmlFor="departureDate" className={labelClass}>Fecha de salida</label>
          <input id="departureDate" name="departureDate" type="date" defaultValue={deal.departureDate.slice(0, 10)} required className={inputClass} />
          <FieldError errors={state.errors?.departureDate} />
        </div>
        <div>
          <label htmlFor="returnDate" className={labelClass}>Fecha de regreso</label>
          <input id="returnDate" name="returnDate" type="date" defaultValue={deal.returnDate?.slice(0, 10) ?? ""} className={inputClass} />
          <FieldError errors={state.errors?.returnDate} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="imageUrl" className={labelClass}>URL de imagen</label>
          <input id="imageUrl" name="imageUrl" type="url" defaultValue={deal.imageUrl} required className={inputClass} />
          <FieldError errors={state.errors?.imageUrl} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bookingUrl" className={labelClass}>URL del proveedor</label>
          <input id="bookingUrl" name="bookingUrl" type="url" defaultValue={deal.bookingUrl} required className={inputClass} />
          <FieldError errors={state.errors?.bookingUrl} />
        </div>
      </div>
    </form>
  );
}
