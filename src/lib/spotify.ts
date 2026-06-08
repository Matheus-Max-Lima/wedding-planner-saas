import { prisma } from "@/lib/prisma";

export async function getValidSpotifyToken(weddingId: string): Promise<string | null> {
  const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
  if (!wedding?.spotifyAccessToken) return null;

  // If token is still valid (with 60s buffer), return it
  if (wedding.spotifyExpiresAt && wedding.spotifyExpiresAt.getTime() - 60000 > Date.now()) {
    return wedding.spotifyAccessToken;
  }

  // Refresh token
  if (!wedding.spotifyRefreshToken) return null;

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: wedding.spotifyRefreshToken,
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      spotifyAccessToken: tokens.access_token,
      spotifyExpiresAt: expiresAt,
      ...(tokens.refresh_token && { spotifyRefreshToken: tokens.refresh_token }),
    },
  });

  return tokens.access_token;
}
