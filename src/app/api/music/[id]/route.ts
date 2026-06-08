import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  // id is a track id — verify it belongs to this wedding via playlist
  const track = await prisma.track.findUnique({
    where: { id },
    include: { playlist: true },
  });
  if (!track || track.playlist.weddingId !== ctx.weddingId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const track = await prisma.track.findUnique({
    where: { id },
    include: { playlist: true },
  });
  if (!track || track.playlist.weddingId !== ctx.weddingId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = await req.json();
  const updated = await prisma.track.update({ where: { id }, data });
  return NextResponse.json(updated);
}
