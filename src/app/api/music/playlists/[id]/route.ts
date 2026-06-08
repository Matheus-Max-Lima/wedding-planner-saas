import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();
  // Verify playlist belongs to wedding
  const playlist = await prisma.playlist.findFirst({ where: { id, weddingId: ctx.weddingId } });
  if (!playlist) return NextResponse.json({ error: "Playlist não encontrada" }, { status: 404 });
  const track = await prisma.track.create({ data: { ...data, playlistId: id } });
  return NextResponse.json(track);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const playlist = await prisma.playlist.findFirst({ where: { id, weddingId: ctx.weddingId } });
  if (!playlist) return NextResponse.json({ error: "Playlist não encontrada" }, { status: 404 });
  await prisma.playlist.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
