import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Radar, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Acceso administrativo",
  description: "Panel editorial de UR WAY.",
};

const features = [
  { icon: Radar, label: "Drops verificados" },
  { icon: ShieldCheck, label: "Control editorial" },
  { icon: CheckCircle2, label: "Publicación precisa" },
];

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  const showDemoCredentials = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main className="relative min-h-screen overflow-hidden bg-midnight px-4 py-6 sm:px-8 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:p-0">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_18%,rgba(82,182,255,0.3),transparent_28%),radial-gradient(circle_at_78%_82%,rgba(255,122,89,0.18),transparent_24%)]" />
      <section className="relative hidden min-h-screen flex-col justify-between p-10 text-white lg:flex xl:p-16">
        <Link href="/" className="inline-flex w-fit items-center gap-3" aria-label="UR WAY, inicio">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <ArrowUpRight size={19} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-[-0.06em]">UR WAY</span>
          <span className="text-[10px] font-bold tracking-[0.18em] text-white/45">BY HUTEC</span>
        </Link>
        <div className="max-w-xl pb-10">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.25em] text-sky">Inteligencia editorial</p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.03] tracking-[-0.055em] xl:text-6xl">
            Menos ruido.<br />Mejores viajes.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/62">
            Detecta, evalúa y publica oportunidades de viaje desde un solo espacio diseñado para decisiones rápidas.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <Icon className="mb-4 text-sky" size={19} />
                <p className="text-sm font-semibold text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/35">Panel privado · UR WAY Operations</p>
      </section>

      <section className="relative flex min-h-[calc(100vh-3rem)] items-center justify-center rounded-[2rem] bg-background px-5 py-12 sm:px-10 lg:min-h-screen lg:rounded-l-[2.5rem] lg:rounded-r-none">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 inline-flex items-center gap-3 lg:hidden" aria-label="UR WAY, inicio">
            <span className="flex size-10 items-center justify-center rounded-full bg-midnight text-white"><ArrowUpRight size={19} /></span>
            <span className="font-display text-xl font-extrabold tracking-[-0.06em] text-midnight">UR WAY</span>
          </Link>
          <div className="mb-8">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">Administración</p>
            <h2 className="font-display text-4xl font-extrabold tracking-[-0.05em] text-midnight">Bienvenido de vuelta</h2>
            <p className="mt-3 text-sm leading-6 text-slate">Ingresa tus credenciales para continuar con la curaduría de Drops.</p>
          </div>
          <LoginForm showDemoCredentials={showDemoCredentials} />
          <p className="mt-8 text-center text-xs text-slate">Acceso exclusivo para el equipo autorizado de UR WAY.</p>
        </div>
      </section>
    </main>
  );
}
