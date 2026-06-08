import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

async function getItem(id: string, weddingId: string) {
  return prisma.checklistItem.findFirst({ where: { id, weddingId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await getItem(id, result.weddingId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.checklistItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await getItem(id, result.weddingId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.checklistItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
