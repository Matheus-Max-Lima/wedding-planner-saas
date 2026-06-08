import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const g = await prisma.bacheloretteGuest.findUnique({ where: { id }, include: { bachelorette: true } });
  if (!g || g.bachelorette.weddingId !== result.weddingId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.bacheloretteGuest.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.confirmed !== undefined && { confirmed: data.confirmed }),
      ...(data.paid !== undefined && { paid: data.paid }),
      ...(data.amountPaid !== undefined && { amountPaid: parseFloat(data.amountPaid) }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const g = await prisma.bacheloretteGuest.findUnique({ where: { id }, include: { bachelorette: true } });
  if (!g || g.bachelorette.weddingId !== result.weddingId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.bacheloretteGuest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
