import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Radar, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/ui/logo";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Acceso administrativo",
  description: "Panel editorial de UR WAY.",
};

const features = [
  { icon: Radar, label: "Rutas verificadas" },
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
        <div className="w-fit"><Logo inverse /></div>
        <div className="max-w-xl pb-10">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.25em] text-sky">Control editorial</p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.03] tracking-[-0.055em] xl:text-6xl">
            Menos ruido.<br />Mejores decisiones.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/62">
            Detecta ofertas, revisa cada detalle y publica solo las rutas que merecen llegar a portada.
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
          <div className="mb-12 w-fit lg:hidden"><Logo /></div>
          <div className="mb-8">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">Administración</p>
            <h2 className="font-display text-4xl font-extrabold tracking-[-0.05em] text-midnight">Bienvenido de vuelta</h2>
            <p className="mt-3 text-sm leading-6 text-slate">Inicia sesión para revisar ofertas, validar detalles y publicar nuevas rutas.</p>
          </div>
          <LoginForm showDemoCredentials={showDemoCredentials} />
          <p className="mt-8 text-center text-xs text-slate">Acceso exclusivo para el equipo autorizado de UR WAY.</p>
        </div>
      </section>
    </main>
  );
}
