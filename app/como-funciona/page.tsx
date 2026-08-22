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
        <section className="bg-sand pb-24 pt-36 sm:pb-32 sm:pt-44">
          <div className="container-page">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.19em] text-coral"><Radar aria-hidden="true" className="size-4" /> Nuestro criterio</p>
            <h1 className="mt-6 max-w-6xl text-balance font-display text-[clamp(4rem,10vw,9.5rem)] font-extrabold leading-[0.78] tracking-[-0.085em] text-midnight">Lo barato llama la atención.<br /><span className="text-coral">Lo que conviene pasa el filtro.</span></h1>
            <p className="mt-9 max-w-2xl text-lg leading-8 text-slate sm:text-xl">Convertimos precio, ahorro, destino, fechas y calidad de vuelo en una recomendación clara. Si no la elegiríamos para nosotros, no la ponemos frente a ti.</p>
          </div>
        </section>

        <section className="bg-midnight py-24 text-white sm:py-32" aria-labelledby="score-heading">
          <div className="container-page grid gap-16 lg:grid-cols-[0.68fr_1.32fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">El score UR WAY</p>
              <h2 id="score-heading" className="mt-5 font-display text-5xl font-extrabold leading-[0.86] tracking-[-0.075em] sm:text-7xl">100 puntos.<br />Cinco señales.</h2>
              <p className="mt-7 max-w-md leading-7 text-white/52">El precio y el ahorro pesan más. Las otras señales evitan que una tarifa barata esconda una experiencia que no compensa.</p>
            </div>
            <ol className="border-t border-white/14">
              {factors.map(({ icon: Icon, name, weight, copy }, index) => (
                <li key={name} className="grid gap-6 border-b border-white/14 py-9 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:py-11">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/7 text-coral"><Icon aria-hidden="true" className="size-5" /></span>
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/35">0{index + 1}</p><h3 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.055em]">{name}</h3><p className="mt-3 max-w-2xl leading-7 text-white/48">{copy}</p></div>
                  <span className="font-display text-4xl font-extrabold tracking-[-0.06em] text-coral">{weight}%</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white py-24 sm:py-32">
          <div className="container-page">
            <div className="grid gap-8 lg:grid-cols-3">
              <article className="rounded-[2.25rem] bg-sand p-8 sm:p-10"><span className="flex size-14 items-center justify-center rounded-2xl bg-midnight text-coral"><Radar aria-hidden="true" /></span><p className="mt-10 text-xs font-extrabold uppercase tracking-[0.16em] text-coral">01 · Detectamos</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] text-midnight">Buscamos anomalías, no anuncios.</h2><p className="mt-4 leading-7 text-slate">Nuestro radar encuentra rutas cuyo precio se sale favorablemente de lo normal.</p></article>
              <article className="rounded-[2.25rem] bg-midnight p-8 text-white sm:p-10"><span className="flex size-14 items-center justify-center rounded-2xl bg-white/8 text-coral"><ShieldCheck aria-hidden="true" /></span><p className="mt-10 text-xs font-extrabold uppercase tracking-[0.16em] text-coral">02 · Verificamos</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em]">Leemos lo que el precio no cuenta.</h2><p className="mt-4 leading-7 text-white/48">Equipaje, escalas, fechas y vigencia pasan por revisión antes de publicar.</p></article>
              <article className="rounded-[2.25rem] bg-coral p-8 sm:p-10"><span className="flex size-14 items-center justify-center rounded-2xl bg-midnight text-white"><Plane aria-hidden="true" /></span><p className="mt-10 text-xs font-extrabold uppercase tracking-[0.16em] text-midnight/55">03 · Tú decides</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] text-midnight">Te damos señal, no presión.</h2><p className="mt-4 leading-7 text-midnight/60">Mostramos el contexto y te llevamos al proveedor. La decisión final siempre es tuya.</p></article>
            </div>
            <div className="mt-14 flex flex-col gap-6 border-t border-midnight/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl font-display text-3xl font-extrabold leading-tight tracking-[-0.055em] text-midnight">Ya conoces el criterio. Ahora encuentra la ruta que te haga querer despegar.</p>
              <Link href="/drops" className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-midnight px-6 text-sm font-extrabold text-white transition hover:bg-coral hover:text-midnight">Ver rutas seleccionadas <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
