import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/data/deals";

const requestSchema = z.object({
  email: z.string().trim().min(1).email().max(254),
  source: z.enum(["website", "footer", "modal", "landing"]).optional().default("website"),
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (attempts.size > 500) {
    for (const [entryKey, entry] of attempts) {
      if (entry.resetAt <= now) attempts.delete(entryKey);
    }
  }
  return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  if (isRateLimited(getClientKey(request))) {
    return NextResponse.json(
      { ok: false, message: "Hiciste varios intentos. Espera unos minutos y vuelve a probar." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
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
