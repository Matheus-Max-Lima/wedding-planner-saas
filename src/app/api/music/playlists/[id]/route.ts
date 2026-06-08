import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const playlist = await prisma.playlist.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.playlist.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
    include: { tracks: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const playlist = await prisma.playlist.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.playlist.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
