import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const DEMO_COOKIE = "urway_demo_admin";

export interface AdminSession {
  id: string;
  email: string;
  role: "ADMIN";
  demo: boolean;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    if (cookieStore.get(DEMO_COOKIE)?.value !== "authenticated") return null;

    return {
      id: "demo-admin",
      email: process.env.DEMO_ADMIN_EMAIL ?? "admin@urway.mx",
      role: "ADMIN",
      demo: true,
    };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") return null;

  return {
    id: user.id,
    email: user.email ?? "admin@urway.mx",
    role: "ADMIN",
    demo: false,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login?next=/admin");
  return admin;
}

export const demoAuthCookie = DEMO_COOKIE;
