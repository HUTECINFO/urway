"use client";

import Link from "next/link";
import { useActionState, useRef, type FormEvent } from "react";
import { Check, Clock3, Eye, LoaderCircle, RefreshCw, Send, X } from "lucide-react";
import { reverifyAdminDealAction, transitionAdminDealAction, type AdminDealActionState } from "@/app/actions/deals";
import { DealStatus } from "@/lib/domain/types";

const initialState: AdminDealActionState = {};

const transitionConfig: Partial<Record<DealStatus, Array<{ label: string; next: DealStatus; icon: typeof Check; style: string }>>> = {
  [DealStatus.DISCOVERED]: [{ label: "Enviar a revisión", next: DealStatus.REVIEW, icon: Eye, style: "border-sky/30 bg-sky/10 text-[#1675a8] hover:bg-sky/20" }],
  [DealStatus.REVIEW]: [
    { label: "Aprobar", next: DealStatus.APPROVED, icon: Check, style: "border-emerald/30 bg-emerald/10 text-[#087c51] hover:bg-emerald/20" },
    { label: "Rechazar", next: DealStatus.REJECTED, icon: X, style: "border-coral/30 bg-coral/10 text-[#b3452f] hover:bg-coral/20" },
  ],
  [DealStatus.APPROVED]: [
    { label: "Publicar", next: DealStatus.PUBLISHED, icon: Send, style: "border-midnight bg-midnight text-white hover:bg-midnight/88" },
    { label: "Rechazar", next: DealStatus.REJECTED, icon: X, style: "border-coral/30 bg-coral/10 text-[#b3452f] hover:bg-coral/20" },
  ],
  [DealStatus.PUBLISHED]: [{ label: "Expirar", next: DealStatus.EXPIRED, icon: Clock3, style: "border-slate/25 bg-slate/8 text-slate hover:bg-slate/15" }],
};

function TransitionButton({ id, label, next, icon: Icon, style }: { id: string; label: string; next: DealStatus; icon: typeof Check; style: string }) {
  const [state, action, pending] = useActionState(transitionAdminDealAction, initialState);
  const rejectionReasonRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (next !== DealStatus.REJECTED) return;
    const reason = window.prompt("Indica el motivo del rechazo:");
    if (!reason?.trim()) {
      event.preventDefault();
      return;
    }
    if (rejectionReasonRef.current) rejectionReasonRef.current.value = reason.trim();
  };

  return (
    <form action={action} className="relative" onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="nextStatus" value={next} />
      <input ref={rejectionReasonRef} type="hidden" name="rejectionReason" />
      <button type="submit" disabled={pending} title={state.message} className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${style}`}>
        {pending ? <LoaderCircle className="animate-spin" size={14} /> : <Icon size={14} />}{label}
      </button>
      {state.message ? <span role={state.status === "error" ? "alert" : "status"} className={`absolute right-0 top-11 z-20 w-56 rounded-xl border bg-white p-2 text-[11px] font-semibold shadow-lg ${state.status === "error" ? "border-coral/20 text-[#b3452f]" : "border-emerald/20 text-[#087c51]"}`}>{state.message}</span> : null}
    </form>
  );
}

function ReverifyButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reverifyAdminDealAction, initialState);

  return (
    <form action={action} className="relative">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} title={state.message ?? "Volver a verificar"} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-midnight/10 bg-white px-3 text-xs font-bold text-slate transition hover:border-midnight/25 hover:text-midnight disabled:cursor-wait disabled:opacity-60">
        {pending ? <LoaderCircle className="animate-spin" size={14} /> : <RefreshCw size={14} />}<span className="sm:hidden xl:inline">Volver a verificar</span>
      </button>
      {state.message ? <span role={state.status === "error" ? "alert" : "status"} className={`absolute right-0 top-11 z-20 w-56 rounded-xl border bg-white p-2 text-[11px] font-semibold shadow-lg ${state.status === "error" ? "border-coral/20 text-[#b3452f]" : "border-emerald/20 text-[#087c51]"}`}>{state.message}</span> : null}
    </form>
  );
}

export function DealActions({ id, status, includeView = true }: { id: string; status: DealStatus; includeView?: boolean }) {
  const transitions = transitionConfig[status] ?? [];
  const canReverify = status !== DealStatus.EXPIRED && status !== DealStatus.REJECTED;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {includeView ? (
        <Link href={`/admin/deals/${id}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-midnight/10 bg-white px-3 text-xs font-bold text-midnight transition hover:border-midnight/25">
          <Eye size={14} /> Ver
        </Link>
      ) : null}
      {transitions.map((transition) => <TransitionButton key={transition.next} id={id} {...transition} />)}
      {canReverify ? <ReverifyButton id={id} /> : null}
    </div>
  );
}
