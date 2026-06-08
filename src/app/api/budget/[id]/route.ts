import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await prisma.budgetItem.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.budgetItem.update({
    where: { id },
    data: {
      ...(data.category !== undefined && { category: data.category }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.estimatedCost !== undefined && { estimatedCost: parseFloat(data.estimatedCost) }),
      ...(data.actualCost !== undefined && { actualCost: parseFloat(data.actualCost) }),
      ...(data.paid !== undefined && { paid: data.paid }),
      ...(data.vendor !== undefined && { vendor: data.vendor }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { installments: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await prisma.budgetItem.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.budgetItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
