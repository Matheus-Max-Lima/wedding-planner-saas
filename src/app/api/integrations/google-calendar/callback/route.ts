import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/timeline?calendar=error`
    );
  }

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/timeline?calendar=error`
    );
  }

  const tokens = await tokenRes.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await prisma.wedding.update({
    where: { userId },
    data: {
      googleCalendarAccessToken: tokens.access_token,
      googleCalendarRefreshToken: tokens.refresh_token,
      googleCalendarExpiresAt: expiresAt,
    },
  });

  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/timeline?calendar=connected`
  );
}
