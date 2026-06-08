import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const track = await prisma.track.findUnique({ where: { id }, include: { playlist: true } });
  if (!track || track.playlist.weddingId !== result.weddingId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const track = await prisma.track.findUnique({ where: { id }, include: { playlist: true } });
  if (!track || track.playlist.weddingId !== result.weddingId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = await req.json();
  const updated = await prisma.track.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.artist !== undefined && { artist: data.artist }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.spotifyUrl !== undefined && { spotifyUrl: data.spotifyUrl }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
  return NextResponse.json(updated);
}
