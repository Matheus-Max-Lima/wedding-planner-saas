import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const gift = await prisma.gift.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!gift) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.gift.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.store !== undefined && { store: data.store }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.price !== undefined && { price: parseFloat(data.price) }),
      ...(data.quantity !== undefined && { quantity: parseInt(data.quantity) }),
      ...(data.quantityReceived !== undefined && { quantityReceived: parseInt(data.quantityReceived) }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const gift = await prisma.gift.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!gift) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.gift.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
