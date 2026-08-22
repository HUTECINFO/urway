"use client";

import Link from "next/link";
import { ArrowDown, Bell, Menu, Plane, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/logo";

function getRouteLabel(pathname: string) {
  if (pathname === "/drops") return "Rutas";
  if (pathname === "/como-funciona") return "Nuestro criterio";
  if (pathname.startsWith("/drop/")) return "La oportunidad";
  if (pathname === "/") return "Explora";
  return "UR WAY";
}

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [observedSection, setObservedSection] = useState<{ path: string; label: string } | null>(null);
  const [flightMode, setFlightMode] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const lastScrollY = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const section = observedSection?.path === pathname ? observedSection.label : getRouteLabel(pathname);

  useEffect(() => {
    const sections = [
      { id: "inicio", label: "Explora" },
      { id: "drops", label: "Rutas" },
      { id: "como-funciona", label: "El criterio" },
      { id: "newsletter", label: "Recibe avisos" },
    ];

    const sectionObserver = new IntersectionObserver((entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      const label = active?.target.getAttribute("data-nav-label");
      if (label) setObservedSection({ path: pathname, label });
    }, { rootMargin: "-22% 0px -68% 0px" });

    sections.forEach(({ id, label }) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.setAttribute("data-nav-label", label);
      sectionObserver.observe(element);
    });

    const updateFlight = () => {
      const nextScrollY = Math.max(0, window.scrollY);
      const delta = nextScrollY - lastScrollY.current;
      setFlightMode(nextScrollY > 88);
      if (Math.abs(delta) > 3) setScrollDirection(delta > 0 ? "down" : "up");
      lastScrollY.current = nextScrollY;
      animationFrame.current = null;
    };

    const onScroll = () => {
      if (animationFrame.current === null) animationFrame.current = window.requestAnimationFrame(updateFlight);
    };

    lastScrollY.current = window.scrollY;
    updateFlight();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      sectionObserver.disconnect();
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const closeMenu = () => setOpen(false);
  const isFlying = flightMode && !open;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="relative mx-auto max-w-[68rem]">
        <div className={`flight-pod pointer-events-auto absolute left-1/2 top-0 w-[6.25rem] -translate-x-1/2 transition-[opacity,transform] duration-200 ease-out ${isFlying ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"}`} aria-hidden={!isFlying}>
          <button type="button" onClick={() => setOpen(true)} tabIndex={isFlying ? 0 : -1} className="flight-control relative flex h-[4.25rem] w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/15 bg-midnight text-coral shadow-[0_14px_42px_rgba(13,27,42,.24)]" aria-label={`Abrir navegación. Volando hacia ${scrollDirection === "down" ? "abajo" : "arriba"}`}>
            <span aria-hidden="true" className={`flight-wind-field flight-wind-field--${scrollDirection}`}>
              {Array.from({ length: 7 }, (_, index) => <i className={`flight-wind flight-wind--${index + 1}`} key={index} />)}
            </span>
            <span aria-hidden="true" className={`flight-heading flight-heading--${scrollDirection}`}>
              <span className="flight-craft"><Plane className="size-8" strokeWidth={1.75} /></span>
            </span>
          </button>
        </div>

        <div className={`dynamic-island pointer-events-auto overflow-hidden rounded-[1.4rem] border transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 ease-out ${isFlying ? "pointer-events-none -translate-y-2 scale-[.97] opacity-0" : "translate-y-0 scale-100 opacity-100"} ${open ? "border-white/12 bg-midnight text-white shadow-[0_24px_70px_rgba(13,27,42,0.22)]" : "border-white/45 bg-white/94 shadow-[0_10px_36px_rgba(13,27,42,0.11)] backdrop-blur-md"}`}>
          <div className="flex min-h-16 items-center gap-3 px-3 sm:px-4">
            <div className={open ? "[&_a_span_span]:text-white" : ""}><Logo inverse={open} compact /></div>
            <span className={`hidden h-5 w-px sm:block ${open ? "bg-white/20" : "bg-midnight/12"}`} />
            <span className={`mr-auto hidden text-[11px] font-bold uppercase tracking-[0.14em] sm:block ${open ? "text-white/45" : "text-slate"}`} aria-live="polite">{section}</span>
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
              <Link href="/drops" onClick={closeMenu} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${open ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-midnight/65 hover:bg-midnight/5 hover:text-midnight"}`}>Ver rutas</Link>
              <Link href="/como-funciona" onClick={closeMenu} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${open ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-midnight/65 hover:bg-midnight/5 hover:text-midnight"}`}>Nuestro criterio</Link>
            </nav>
            <Link href="/#newsletter" onClick={closeMenu} className={`hidden min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition sm:inline-flex ${open ? "bg-coral text-midnight hover:bg-white" : "bg-midnight text-white hover:bg-coral hover:text-midnight"}`}>
              <Bell aria-hidden="true" className="size-4" /> Recibir avisos
            </Link>
            <button type="button" onClick={() => setOpen((current) => !current)} className={`inline-flex size-11 items-center justify-center rounded-xl transition ${open ? "bg-white text-midnight hover:bg-coral" : "bg-sand text-midnight hover:bg-coral"}`} aria-expanded={open} aria-controls="island-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"}>
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>

          <div id="island-menu" className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!open}>
            <div className="min-h-0 overflow-hidden">
              <div className="grid gap-8 border-t border-white/12 px-5 pb-6 pt-7 sm:px-8 sm:pb-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
                <nav className="grid gap-1" aria-label="Menú expandido">
                  <Link href="/" onClick={closeMenu} tabIndex={open ? 0 : -1} className="group flex items-center justify-between rounded-2xl px-3 py-2 font-display text-[clamp(1.65rem,4vw,3.2rem)] font-extrabold tracking-[-0.06em] text-white/60 transition hover:bg-white/5 hover:text-white">Explora <span className="text-base text-coral transition group-hover:translate-x-1">01</span></Link>
                  <Link href="/drops" onClick={closeMenu} tabIndex={open ? 0 : -1} className="group flex items-center justify-between rounded-2xl px-3 py-2 font-display text-[clamp(1.65rem,4vw,3.2rem)] font-extrabold tracking-[-0.06em] text-white/60 transition hover:bg-white/5 hover:text-white">Ver rutas <span className="text-base text-coral transition group-hover:translate-x-1">02</span></Link>
                  <Link href="/como-funciona" onClick={closeMenu} tabIndex={open ? 0 : -1} className="group flex items-center justify-between rounded-2xl px-3 py-2 font-display text-[clamp(1.65rem,4vw,3.2rem)] font-extrabold tracking-[-0.06em] text-white/60 transition hover:bg-white/5 hover:text-white">Nuestro criterio <span className="text-base text-coral transition group-hover:translate-x-1">03</span></Link>
                </nav>
                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Una sola señal</p>
                  <p className="mt-3 max-w-sm font-display text-2xl font-bold leading-tight tracking-[-0.04em]">Todo lo importante en un mismo lugar: precio, ruta y contexto.</p>
                  <Link href="/#newsletter" onClick={closeMenu} tabIndex={open ? 0 : -1} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-white">Recibir el próximo aviso <ArrowDown aria-hidden="true" className="size-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
