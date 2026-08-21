import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function PublicFooter() {
  return (
    <footer className="bg-midnight text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Logo inverse />
          <p className="mt-5 max-w-md font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-white/90">Viajar mejor empieza por elegir mejor.</p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">UR WAY selecciona oportunidades y compara precios de referencia. No somos una agencia de viajes ni emitimos boletos.</p>
        </div>
        <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/60" aria-label="Navegación al pie">
          <Link href="/#drops" className="transition hover:text-white">Drops</Link>
          <Link href="/#como-funciona" className="transition hover:text-white">Cómo funciona</Link>
          <Link href="/#newsletter" className="transition hover:text-white">Newsletter</Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-5 text-xs text-white/35">
          <span>© {new Date().getFullYear()} HUTEC. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
