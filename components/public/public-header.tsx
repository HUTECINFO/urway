import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-midnight/7 bg-background/90 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-5 text-sm font-semibold text-slate" aria-label="Navegación principal">
          <Link href="/#drops" className="hidden transition-colors hover:text-midnight sm:block">Drops</Link>
          <Link href="/#como-funciona" className="hidden transition-colors hover:text-midnight md:block">Cómo funciona</Link>
          <Link href="/#newsletter" className="rounded-full bg-midnight px-4 py-2.5 text-white transition hover:bg-midnight/90">Recibir Drops</Link>
        </nav>
      </div>
    </header>
  );
}
