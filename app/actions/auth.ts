"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { demoAuthCookie } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

function clearRateLimit(identifier: string) {
  loginAttempts.delete(identifier);
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: "Revisa tu correo y contraseña." };

  const email = parsed.data.email.toLowerCase().trim();
  if (!checkRateLimit(email)) {
    return { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." };
  }

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return { error: "La autenticación demo no está disponible en producción." };
    }
    const validEmail = (process.env.DEMO_ADMIN_EMAIL ?? "admin@urway.mx").toLowerCase().trim();
    const validPassword = process.env.DEMO_ADMIN_PASSWORD ?? "urway-demo";
    if (!safeCompare(email, validEmail) || !safeCompare(parsed.data.password, validPassword)) {
      return { error: "Credenciales incorrectas." };
    }

    clearRateLimit(email);
    const cookieStore = await cookies();
    cookieStore.set(demoAuthCookie, "authenticated", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 4,
      path: "/",
    });
    redirect("/admin");
  }

  const supabase = await createClient();
  if (!supabase) return { error: "No se pudo iniciar sesión." };

  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error) return { error: "Credenciales incorrectas." };
  clearRateLimit(email);
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(demoAuthCookie);
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
