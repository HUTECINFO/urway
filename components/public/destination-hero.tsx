"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Plane } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useMotionProfile } from "@/components/ui/use-motion-profile";
import type { Deal } from "@/lib/domain/types";
import { getCountryImageUrl } from "@/lib/media/country-images";
import { formatMoney, formatShortDate } from "./deal-formatters";
import { DealBadge } from "./deal-badge";

interface DestinationHeroProps {
  deal?: Deal;
  children?: ReactNode;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function DestinationHero({ deal, children }: DestinationHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { reducedMotion, simplifyScrollMotion } = useMotionProfile();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 92, damping: 26, mass: 0.3 });
  const imageY = useTransform(progress, [0, 1], ["0%", "13%"]);
  const imageScale = useTransform(progress, [0, 1], [1.02, 1.12]);
  const contentY = useTransform(progress, [0, 0.8], [0, -46]);
  const contentOpacity = useTransform(progress, [0, 0.68], [1, 0.28]);
  const routePlaneX = useTransform(progress, [0, 0.55], [0, 22]);

  const entrance = (delay: number) => ({
    initial: reducedMotion ? false : simplifyScrollMotion ? { opacity: 0, y: 18 } : { opacity: 0, y: 28, filter: "blur(8px)" },
    animate: simplifyScrollMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: simplifyScrollMotion ? 0.54 : 0.82, delay, ease },
  });

  return (
    <section ref={heroRef} id="inicio" className="hero-stage relative min-h-[max(52rem,100svh)] overflow-hidden bg-midnight text-white sm:min-h-[100svh]">
      <motion.div className="absolute -inset-x-5 -inset-y-12" style={simplifyScrollMotion ? undefined : { y: imageY, scale: imageScale }}>
        <Image
          src={deal?.imageUrl ?? getCountryImageUrl("MX")}
          alt={deal ? `Vista de ${deal.destination.city}, ${deal.destination.country}` : "Vista aérea desde la ventana de un avión"}
          fill
          priority
          loading="eager"
          sizes="100vw"
          className="hero-image object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,19,31,.24)_0%,rgba(8,19,31,.12)_25%,rgba(8,19,31,.6)_57%,rgba(8,19,31,.97)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(255,122,89,.3),transparent_28%),radial-gradient(circle_at_18%_45%,rgba(82,182,255,.16),transparent_32%)]" />
      <div aria-hidden="true" className={`hero-grain absolute inset-0 ${simplifyScrollMotion ? "opacity-20" : "opacity-40"}`} />

      <motion.div
        className="container-page relative flex min-h-[max(52rem,100svh)] flex-col pb-5 pt-24 sm:min-h-[100svh] sm:pb-8 sm:pt-32 lg:pb-10"
        style={simplifyScrollMotion ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.div {...entrance(0.05)} className="flex items-center justify-between gap-3 pt-1 sm:pt-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-midnight/24 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.16em] backdrop-blur-xl sm:text-[10px]">
            Ofertas desde México
          </p>
          {deal && <DealBadge type={deal.dealType} />}
        </motion.div>

        <div className="mt-auto grid gap-4 pb-4 sm:gap-7 sm:pb-7 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <div className="overflow-hidden pb-1">
              <motion.h1
                initial={reducedMotion ? false : { y: "105%", rotate: 1.8 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1, delay: 0.16, ease }}
                className="max-w-5xl text-pretty font-display text-[clamp(3.25rem,15.6vw,9.7rem)] font-extrabold leading-[0.83] tracking-[-0.078em] sm:leading-[0.78] sm:tracking-[-0.085em]"
              >
                Viaja más.<br /><span className="hero-title-accent">Paga lo justo.</span>
              </motion.h1>
            </div>
            <motion.p {...entrance(0.28)} className="mt-3 max-w-xl text-pretty text-[14px] leading-5 text-white/68 sm:mt-6 sm:text-xl sm:leading-8">
              Encontramos ofertas fuera de lo común desde México, revisamos cada detalle y te mostramos solo las que sí vale la pena considerar.
            </motion.p>
          </div>

          <motion.div {...entrance(0.36)} className="hero-origin-card rounded-[1.35rem] border border-white/18 bg-white/12 p-3.5 backdrop-blur-2xl sm:rounded-[1.75rem] sm:p-5">
            <div className="mb-3 flex items-center justify-between text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/48">
              <span>Define tu radar</span><span className="size-1.5 rounded-full bg-emerald shadow-[0_0_12px_rgba(22,199,132,.9)]" />
            </div>
            {children}
          </motion.div>
        </div>

        {deal && (
          <motion.div {...entrance(0.46)} className="hero-ticket relative overflow-hidden rounded-[1.4rem] border border-white/15 bg-[#f7f4ed] text-midnight shadow-[0_24px_80px_rgba(0,0,0,.26)] sm:rounded-[2rem]">
            <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-coral">Oferta destacada · 01</p>
                    <p className="mt-1 text-xs font-semibold text-slate">{deal.destination.city} · {formatShortDate(deal.travelStartDate)} — {formatShortDate(deal.travelEndDate)}</p>
                  </div>
                  {deal.savingsPercentage > 0 && (
                    <span className="rounded-full bg-[#dff4ec] px-2.5 py-1.5 text-[10px] font-extrabold text-[#075d46]">−{Math.round(deal.savingsPercentage)}%</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:mt-5 sm:gap-5">
                  <div><strong className="font-display text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">{deal.origin.code}</strong><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate">Origen</p></div>
                  <div className="hero-route-line relative h-px bg-midnight/18">
                    <motion.span aria-hidden="true" className="absolute -top-3 left-[38%] flex size-6 items-center justify-center rounded-full bg-midnight text-coral shadow-lg" style={simplifyScrollMotion ? undefined : { x: routePlaneX }}><Plane className="size-3.5 rotate-90" /></motion.span>
                  </div>
                  <div className="text-right"><strong className="font-display text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">{deal.destination.code}</strong><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate">Destino</p></div>
                </div>
              </div>

              <div className="hero-ticket-action grid grid-cols-[1fr_auto] items-center gap-4 border-t border-dashed border-midnight/15 bg-white/48 p-4 sm:min-w-72 sm:grid-cols-1 sm:border-l sm:border-t-0 sm:p-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate">Viaje redondo desde</p>
                  <p className="mt-0.5 font-display text-[1.75rem] font-extrabold tracking-[-0.055em] sm:text-3xl">{formatMoney(deal.price, deal.currency)}</p>
                </div>
                <Link href={`/drop/${deal.slug}`} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-coral px-4 text-xs font-extrabold text-midnight transition duration-300 hover:-translate-y-0.5 hover:bg-midnight hover:text-white sm:text-sm">
                  Ver oferta <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        <Link href="#drops" className="mx-auto mt-3 hidden items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-white/46 transition hover:text-white sm:flex">
          Desliza para explorar <ArrowDown aria-hidden="true" className="size-3.5" />
        </Link>
      </motion.div>
    </section>
  );
}
