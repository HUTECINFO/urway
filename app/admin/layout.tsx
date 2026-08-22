import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ExternalLink, FileSearch, LayoutDashboard, LogOut, Plane } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

const navigation = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin#drops", label: "Drops", icon: FileSearch },
  { href: "/admin#rendimiento", label: "Rendimiento", icon: BarChart3 },
];

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-midnight lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden h-screen flex-col border-r border-white/10 bg-midnight px-5 py-6 text-white lg:sticky lg:top-0 lg:flex">
        <div className="px-2"><Logo inverse href="/admin" label="UR WAY Admin" /></div>
        <nav className="mt-12 space-y-1.5" aria-label="Administración">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Workspace</p>
          {navigation.map(({ href, label, icon: Icon }, index) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${index === 0 ? "bg-white text-midnight" : "text-white/60 hover:bg-white/8 hover:text-white"}`}
            >
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Plane className="mb-3 text-sky" size={18} />
            <p className="text-sm font-semibold">Criterio en cada ruta</p>
            <p className="mt-1 text-xs leading-5 text-white/45">Cada score ayuda a decidir qué tarifa merece convertirse en una oportunidad.</p>
          </div>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/8 hover:text-white" type="submit">
              <LogOut size={17} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-midnight/8 bg-[#f6f5f1]/90 backdrop-blur-xl">
          <div className="flex h-18 items-center justify-between px-4 sm:px-7 lg:px-10">
            <div className="lg:hidden"><Logo compact href="/admin" label="UR WAY Admin" /></div>
            <div className="hidden lg:block">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate">Operations</p>
              <p className="text-sm font-semibold text-midnight">Centro de decisiones editoriales</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" target="_blank" className="hidden items-center gap-2 rounded-full border border-midnight/10 bg-white px-4 py-2 text-xs font-bold text-midnight transition hover:border-midnight/25 sm:flex">
                Ver sitio <ExternalLink size={14} />
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-midnight/10 bg-white py-1.5 pl-1.5 pr-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-sky/15 text-xs font-extrabold text-midnight">{admin.email.slice(0, 1).toUpperCase()}</span>
                <span className="hidden max-w-36 truncate text-xs font-semibold text-midnight sm:block">{admin.email}</span>
              </div>
              <form action={logoutAction} className="lg:hidden">
                <button type="submit" aria-label="Cerrar sesión" className="flex size-10 items-center justify-center rounded-full border border-midnight/10 bg-white text-slate"><LogOut size={17} /></button>
              </form>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-midnight/6 px-4 py-2 lg:hidden" aria-label="Administración móvil">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-slate hover:bg-white hover:text-midnight"><Icon size={14} />{label}</Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-7 sm:px-7 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
