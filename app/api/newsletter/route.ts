import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/data/deals";
import { RATE_LIMITS, getClientKey, isRateLimited, rateLimitResponse } from "@/lib/security/rate-limit";

const requestSchema = z.object({
  email: z.string().trim().min(1).email().max(254),
  source: z.enum(["website", "footer", "modal", "landing"]).optional().default("website"),
});

export async function POST(request: Request) {
  if (isRateLimited("newsletter", getClientKey(request), RATE_LIMITS.newsletter)) {
    return rateLimitResponse(900, "Hiciste varios intentos. Espera unos minutos y vuelve a probar.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2_048) {
    return NextResponse.json({ ok: false, message: "La solicitud no es válida." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "La solicitud no es válida." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Escribe un correo válido." }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(parsed.data.email, parsed.data.source);
    return NextResponse.json({ ok: true, message: "Suscripción completada." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos completar tu suscripción. Intenta de nuevo más tarde." },
      { status: 500 },
    );
  }
}
