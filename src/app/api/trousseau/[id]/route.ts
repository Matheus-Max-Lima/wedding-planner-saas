import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await prisma.trousseauItem.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.trousseauItem.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.quantity !== undefined && { quantity: parseInt(data.quantity) }),
      ...(data.quantityOwned !== undefined && { quantityOwned: parseInt(data.quantityOwned) }),
      ...(data.estimatedPrice !== undefined && { estimatedPrice: parseFloat(data.estimatedPrice) }),
      ...(data.store !== undefined && { store: data.store }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.purchased !== undefined && { purchased: data.purchased }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const item = await prisma.trousseauItem.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.trousseauItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
