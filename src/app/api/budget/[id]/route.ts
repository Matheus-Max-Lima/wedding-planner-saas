import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();

  const item = await prisma.budgetItem.update({
    where: { id, weddingId: ctx.weddingId },
    data: {
      ...(data.category !== undefined && { category: data.category }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.estimatedCost !== undefined && { estimatedCost: Number(data.estimatedCost) }),
      ...(data.actualCost !== undefined && { actualCost: Number(data.actualCost) }),
      ...(data.paid !== undefined && { paid: Number(data.paid) }),
      ...(data.vendor !== undefined && { vendor: data.vendor }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { installments: true },
  });

  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();

  const item = await prisma.budgetItem.update({
    where: { id, weddingId: ctx.weddingId },
    data,
    include: { installments: true },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  await prisma.budgetItem.delete({ where: { id, weddingId: ctx.weddingId } });
  return NextResponse.json({ success: true });
}
