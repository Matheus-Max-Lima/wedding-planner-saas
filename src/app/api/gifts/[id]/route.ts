import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();
  const gift = await prisma.gift.update({
    where: { id, weddingId: ctx.weddingId },
    data,
  });
  return NextResponse.json(gift);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  await prisma.gift.delete({ where: { id, weddingId: ctx.weddingId } });
  return NextResponse.json({ success: true });
}
