import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();
  const table = await prisma.table.update({
    where: { id, weddingId: ctx.weddingId },
    data,
    include: { guests: true },
  });
  return NextResponse.json(table);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  // Unassign guests from this table first
  await prisma.guest.updateMany({ where: { tableId: id }, data: { tableId: null } });
  await prisma.table.delete({ where: { id, weddingId: ctx.weddingId } });
  return NextResponse.json({ success: true });
}
