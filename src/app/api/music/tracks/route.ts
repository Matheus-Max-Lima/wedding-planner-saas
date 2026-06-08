import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  // Verify the playlist belongs to this wedding
  const playlist = await prisma.playlist.findUnique({
    where: { id: data.playlistId },
  });
  if (!playlist || playlist.weddingId !== ctx.weddingId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const track = await prisma.track.create({ data });
  return NextResponse.json(track);
}
