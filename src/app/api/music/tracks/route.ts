import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const playlist = await prisma.playlist.findFirst({ where: { id: data.playlistId, weddingId: result.weddingId } });
  if (!playlist) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  const track = await prisma.track.create({
    data: {
      playlistId: data.playlistId,
      title: data.title,
      artist: data.artist || null,
      duration: data.duration || null,
      spotifyUrl: data.spotifyUrl || null,
      order: data.order || 0,
    },
  });
  return NextResponse.json(track, { status: 201 });
}
