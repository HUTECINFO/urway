"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().trim().min(1, "Escribe tu correo.").email("Escribe un correo válido.").max(254, "El correo es demasiado largo."),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  source?: string;
  inverse?: boolean;
}

export function NewsletterForm({ source = "website", inverse = false }: NewsletterFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterValues) {
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, source }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok) {
        setError("root", { message: payload.message ?? "No pudimos completar tu suscripción. Intenta de nuevo." });
        return;
      }
      reset();
    } catch {
      setError("root", { message: "No hay conexión. Revisa tu red e intenta de nuevo." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor={`newsletter-email-${source}`} className="sr-only">Correo electrónico</label>
          <input
            id={`newsletter-email-${source}`}
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={`newsletter-status-${source}`}
            className={`h-14 w-full rounded-2xl border px-4 text-base transition placeholder:text-slate/70 ${inverse ? "border-white/20 bg-white/10 text-white focus:bg-white/15" : "border-midnight/12 bg-white text-midnight"}`}
            {...register("email")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${inverse ? "bg-white text-midnight hover:bg-sand" : "bg-midnight text-white hover:bg-midnight/90"}`}
        >
          {isSubmitting ? "Guardando…" : "Avísame de una buena"}
          {!isSubmitting && <ArrowRight aria-hidden="true" className="size-4" />}
        </button>
      </div>
      <div id={`newsletter-status-${source}`} className={`mt-3 min-h-5 text-sm ${inverse ? "text-white/70" : "text-slate"}`} aria-live="polite">
        {errors.email?.message ?? errors.root?.message}
        {isSubmitSuccessful && !errors.root && (
          <span className="inline-flex items-center gap-2 font-semibold text-emerald">
            <Check aria-hidden="true" className="size-4" /> Listo. Te avisaremos cuando encontremos una ruta que valga la pena.
          </span>
        )}
      </div>
    </form>
  );
}
