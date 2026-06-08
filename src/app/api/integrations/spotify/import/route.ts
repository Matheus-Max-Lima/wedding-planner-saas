import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { getValidSpotifyToken } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { spotifyPlaylistId, localPlaylistId } = await req.json();
  if (!spotifyPlaylistId || !localPlaylistId) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  // Verify local playlist belongs to this wedding
  const localPlaylist = await prisma.playlist.findFirst({
    where: { id: localPlaylistId, weddingId: ctx.weddingId },
    include: { tracks: true },
  });
  if (!localPlaylist) {
    return NextResponse.json({ error: "Playlist não encontrada" }, { status: 404 });
  }

  const token = await getValidSpotifyToken(ctx.weddingId);
  if (!token) {
    return NextResponse.json({ error: "Spotify não conectado" }, { status: 401 });
  }

  // Fetch all tracks from the Spotify playlist (paginate if needed)
  let url: string | null = `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks?limit=100&fields=items(track(id,name,artists,duration_ms)),next`;
  const spotifyTracks: any[] = [];

  while (url) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) break;
    const data = await res.json();
    spotifyTracks.push(...(data.items ?? []));
    url = data.next ?? null;
  }

  const existingOrder = localPlaylist.tracks.length;
  const tracksToCreate = spotifyTracks
    .filter((item) => item?.track?.name)
    .map((item, idx) => ({
      playlistId: localPlaylistId,
      title: item.track.name as string,
      artist: (item.track.artists as any[]).map((a: any) => a.name).join(", "),
      spotifyId: item.track.id as string,
      duration: item.track.duration_ms ? Math.round(item.track.duration_ms / 1000) : undefined,
      order: existingOrder + idx,
    }));

  await prisma.track.createMany({ data: tracksToCreate });

  return NextResponse.json({ imported: tracksToCreate.length });
}
