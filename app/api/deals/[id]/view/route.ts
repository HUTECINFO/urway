import { NextRequest, NextResponse } from "next/server";
import { getDealById, recordDealView } from "@/lib/data/deals";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deal = await getDealById(id);
  if (!deal) return NextResponse.json({ ok: false }, { status: 404 });

  const sessionId = request.cookies.get("urway_session")?.value ?? crypto.randomUUID();
  await recordDealView(id, sessionId);
  const response = NextResponse.json({ ok: true }, { status: 201 });
  if (!request.cookies.has("urway_session")) {
    response.cookies.set("urway_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
