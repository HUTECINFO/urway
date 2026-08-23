"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { loginAction, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm({ showDemoCredentials }: { showDemoCredentials: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.16em] text-slate">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={showDemoCredentials ? "admin@urway.mx" : undefined}
            className="h-13 w-full rounded-2xl border border-midnight/10 bg-white pl-12 pr-4 text-sm text-midnight transition placeholder:text-slate/60 hover:border-midnight/20 focus:border-sky"
            placeholder="admin@urway.mx"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.16em] text-slate">
          Contraseña
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            defaultValue={showDemoCredentials ? "urway-demo" : undefined}
            className="h-13 w-full rounded-2xl border border-midnight/10 bg-white pl-12 pr-4 text-sm text-midnight transition placeholder:text-slate/60 hover:border-midnight/20 focus:border-sky"
            placeholder="Tu contraseña"
          />
        </div>
      </div>
      {state.error ? (
        <p role="alert" className="rounded-xl border border-coral/25 bg-coral/8 px-4 py-3 text-sm font-semibold text-[#ad442d]">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-midnight px-5 text-sm font-bold text-white transition hover:bg-midnight/90 disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />}
        {pending ? "Verificando…" : "Entrar al panel"}
      </button>
      {showDemoCredentials ? (
        <div className="rounded-2xl border border-sky/25 bg-sky/8 p-4 text-sm text-midnight">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate">Acceso demo</p>
          <p><span className="font-semibold">Correo:</span> admin@urway.mx</p>
          <p><span className="font-semibold">Contraseña:</span> urway-demo</p>
        </div>
      ) : null}
    </form>
  );
}
