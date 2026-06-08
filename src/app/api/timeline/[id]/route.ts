import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await prisma.timelineItem.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.timelineItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.responsible !== undefined && { responsible: data.responsible }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await prisma.timelineItem.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.timelineItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
