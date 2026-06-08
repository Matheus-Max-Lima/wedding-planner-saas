import { prisma } from "@/lib/prisma";

export async function getValidGoogleCalendarToken(weddingId: string): Promise<string | null> {
  const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
  if (!wedding?.googleCalendarAccessToken) return null;

  if (
    wedding.googleCalendarExpiresAt &&
    wedding.googleCalendarExpiresAt.getTime() - 60000 > Date.now()
  ) {
    return wedding.googleCalendarAccessToken;
  }

  if (!wedding.googleCalendarRefreshToken) return null;

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: wedding.googleCalendarRefreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      googleCalendarAccessToken: tokens.access_token,
      googleCalendarExpiresAt: expiresAt,
    },
  });

  return tokens.access_token;
}
