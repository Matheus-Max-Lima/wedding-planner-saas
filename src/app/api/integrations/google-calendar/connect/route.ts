import { NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google Calendar não configurado" }, { status: 503 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline",
    prompt: "consent",
    state: ctx.userId,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
