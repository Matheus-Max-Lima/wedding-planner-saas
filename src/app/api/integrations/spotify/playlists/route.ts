import { NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { getValidSpotifyToken } from "@/lib/spotify";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const token = await getValidSpotifyToken(ctx.weddingId);
  if (!token) {
    return NextResponse.json({ error: "Spotify não conectado" }, { status: 401 });
  }

  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar playlists" }, { status: res.status });
  }

  const data = await res.json();
  const playlists = (data.items as any[]).map((pl) => ({
    id: pl.id,
    name: pl.name,
    totalTracks: pl.tracks?.total ?? 0,
    imageUrl: pl.images?.[0]?.url ?? null,
  }));

  return NextResponse.json(playlists);
}
