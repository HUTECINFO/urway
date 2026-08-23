import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function PublicFooter() {
  return (
    <footer className="bg-midnight text-white">
      <div className="container-page grid gap-8 py-12 sm:gap-10 sm:py-14 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Logo inverse />
          <p className="mt-5 max-w-md font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-white/90">El viaje empieza mucho antes del aeropuerto.</p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">UR WAY encuentra y compara oportunidades de vuelo. No somos una agencia ni emitimos boletos: te llevamos al proveedor cuando decides reservar.</p>
        </div>
        <nav className="grid gap-3 text-sm text-white/60 min-[390px]:flex min-[390px]:flex-wrap min-[390px]:gap-x-7 min-[390px]:gap-y-3" aria-label="Navegación al pie">
          <Link href="/drops" className="transition hover:text-white">Ver rutas</Link>
          <Link href="/como-funciona" className="transition hover:text-white">Nuestro criterio</Link>
          <Link href="/#newsletter" className="transition hover:text-white">Recibir avisos</Link>
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
