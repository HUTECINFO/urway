import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, CalendarRange, Map, Plane, PiggyBank, Radar, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export const metadata: Metadata = {
  title: "Cómo elegimos una ruta",
  description: "Conoce el criterio de UR WAY para separar una tarifa barata de una oportunidad que realmente vale el viaje.",
  alternates: { canonical: "/como-funciona" },
};

const factors = [
  { icon: BadgeDollarSign, name: "Precio", weight: 40, copy: "Comparamos la tarifa contra el rango real de una ruta, no contra un descuento publicitario." },
  { icon: PiggyBank, name: "Ahorro", weight: 25, copy: "Medimos cuánto queda en tu bolsillo frente al precio habitual de ese mismo viaje." },
  { icon: Map, name: "Destino", weight: 15, copy: "Valoramos qué tan especial es la oportunidad según el destino y la dificultad de encontrarla." },
  { icon: CalendarRange, name: "Fechas", weight: 10, copy: "Revisamos anticipación, flexibilidad y si la ventana tiene sentido para organizar el viaje." },
  { icon: Plane, name: "Calidad del vuelo", weight: 10, copy: "Escalas, duración y horarios importan: lo barato deja de ser bueno cuando el trayecto no compensa." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="bg-sand pb-20 pt-32 sm:pb-32 sm:pt-44">
          <div className="container-page">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.19em] text-coral"><Radar aria-hidden="true" className="size-4" /> Nuestro criterio</p>
            <h1 className="mt-5 max-w-6xl text-balance font-display text-[clamp(3.15rem,14vw,9.5rem)] font-extrabold leading-[0.84] tracking-[-0.075em] text-midnight sm:mt-6 sm:leading-[0.78] sm:tracking-[-0.085em]">Lo barato llama la atención.<br /><span className="text-coral">Lo que conviene pasa el filtro.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate sm:mt-9 sm:text-xl sm:leading-8">Convertimos precio, ahorro, destino, fechas y calidad de vuelo en una recomendación clara. Si no la elegiríamos para nosotros, no la ponemos frente a ti.</p>
          </div>
        </section>

        <section className="bg-midnight py-20 text-white sm:py-32" aria-labelledby="score-heading">
          <div className="container-page grid gap-12 sm:gap-16 lg:grid-cols-[0.68fr_1.32fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">El score UR WAY</p>
              <h2 id="score-heading" className="mt-4 font-display text-[3rem] font-extrabold leading-[0.9] tracking-[-0.07em] sm:mt-5 sm:text-7xl sm:leading-[0.86] sm:tracking-[-0.075em]">100 puntos.<br />Cinco señales.</h2>
              <p className="mt-7 max-w-md leading-7 text-white/52">El precio y el ahorro pesan más. Las otras señales evitan que una tarifa barata esconda una experiencia que no compensa.</p>
            </div>
            <ol className="border-t border-white/14">
              {factors.map(({ icon: Icon, name, weight, copy }, index) => (
                <li key={name} className="grid grid-cols-[3rem_1fr_auto] items-start gap-3 border-b border-white/14 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6 sm:py-11">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-white/7 text-coral sm:size-12 sm:rounded-2xl"><Icon aria-hidden="true" className="size-5" /></span>
                  <div><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/35 sm:text-[10px]">0{index + 1}</p><h3 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.05em] sm:text-3xl sm:tracking-[-0.055em]">{name}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/48 sm:mt-3 sm:text-base sm:leading-7">{copy}</p></div>
                  <span className="font-display text-2xl font-extrabold tracking-[-0.05em] text-coral sm:text-4xl sm:tracking-[-0.06em]">{weight}%</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-32">
          <div className="container-page">
            <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
              <article className="rounded-[1.75rem] bg-sand p-6 sm:rounded-[2.25rem] sm:p-10"><span className="flex size-12 items-center justify-center rounded-2xl bg-midnight text-coral sm:size-14"><Radar aria-hidden="true" /></span><p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.16em] text-coral sm:mt-10 sm:text-xs">01 · Detectamos</p><h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.05em] text-midnight sm:text-3xl sm:tracking-[-0.055em]">Buscamos anomalías, no anuncios.</h2><p className="mt-4 text-sm leading-6 text-slate sm:text-base sm:leading-7">Nuestro radar encuentra rutas cuyo precio se sale favorablemente de lo normal.</p></article>
              <article className="rounded-[1.75rem] bg-midnight p-6 text-white sm:rounded-[2.25rem] sm:p-10"><span className="flex size-12 items-center justify-center rounded-2xl bg-white/8 text-coral sm:size-14"><ShieldCheck aria-hidden="true" /></span><p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.16em] text-coral sm:mt-10 sm:text-xs">02 · Verificamos</p><h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.05em] sm:text-3xl sm:tracking-[-0.055em]">Leemos lo que el precio no cuenta.</h2><p className="mt-4 text-sm leading-6 text-white/48 sm:text-base sm:leading-7">Equipaje, escalas, fechas y vigencia pasan por revisión antes de publicar.</p></article>
              <article className="rounded-[1.75rem] bg-coral p-6 sm:rounded-[2.25rem] sm:p-10"><span className="flex size-12 items-center justify-center rounded-2xl bg-midnight text-white sm:size-14"><Plane aria-hidden="true" /></span><p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.16em] text-midnight/55 sm:mt-10 sm:text-xs">03 · Tú decides</p><h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.05em] text-midnight sm:text-3xl sm:tracking-[-0.055em]">Te damos señal, no presión.</h2><p className="mt-4 text-sm leading-6 text-midnight/60 sm:text-base sm:leading-7">Mostramos el contexto y te llevamos al proveedor. La decisión final siempre es tuya.</p></article>
            </div>
            <div className="mt-10 flex flex-col gap-6 border-t border-midnight/10 pt-8 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:pt-10">
              <p className="max-w-xl font-display text-[1.8rem] font-extrabold leading-tight tracking-[-0.05em] text-midnight sm:text-3xl sm:tracking-[-0.055em]">Ya conoces el criterio. Ahora encuentra la ruta que te haga querer despegar.</p>
              <Link href="/drops" className="inline-flex min-h-13 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-midnight px-6 text-sm font-extrabold text-white transition hover:bg-coral hover:text-midnight sm:w-auto">Ver rutas seleccionadas <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
