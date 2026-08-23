import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isBlockedBot, isSuspiciousRequest } from "@/lib/security/bot-detection";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
};

export async function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent");

  if (isBlockedBot(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/") || pathname.startsWith("/go/");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (isApiRoute && isSuspiciousRequest(request)) {
    return new NextResponse(JSON.stringify({ ok: false, message: "Solicitud no válida." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  if (isAdminRoute && isBlockedBot(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let response = NextResponse.next({ request });

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|brand|media).*)"],
};
