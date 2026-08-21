"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { demoAuthCookie } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: "Revisa tu correo y contraseña." };

  if (!isSupabaseConfigured()) {
    const validEmail = process.env.DEMO_ADMIN_EMAIL ?? "admin@urway.mx";
    const validPassword = process.env.DEMO_ADMIN_PASSWORD ?? "urway-demo";
    if (parsed.data.email !== validEmail || parsed.data.password !== validPassword) {
      return { error: "Credenciales incorrectas." };
    }

    const cookieStore = await cookies();
    cookieStore.set(demoAuthCookie, "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin");
  }

  const supabase = await createClient();
  if (!supabase) return { error: "No se pudo iniciar sesión." };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Credenciales incorrectas." };
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(demoAuthCookie);
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
