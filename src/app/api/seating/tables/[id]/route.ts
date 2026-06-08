import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const table = await prisma.table.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.table.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.capacity !== undefined && { capacity: parseInt(data.capacity) }),
      ...(data.shape !== undefined && { shape: data.shape }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { guests: { select: { id: true, name: true, status: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const table = await prisma.table.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.table.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
