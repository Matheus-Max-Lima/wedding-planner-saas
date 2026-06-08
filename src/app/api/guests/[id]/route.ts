import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();

  const guest = await prisma.guest.update({
    where: { id, weddingId: ctx.weddingId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.side !== undefined && { side: data.side }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.plusOne !== undefined && { plusOne: data.plusOne }),
      ...(data.plusOneName !== undefined && { plusOneName: data.plusOneName }),
      ...(data.dietary !== undefined && { dietary: data.dietary }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.tableId !== undefined && { tableId: data.tableId }),
      ...(data.inviteSent !== undefined && { inviteSent: data.inviteSent }),
    },
    include: { table: { select: { id: true, name: true } } },
  });

  return NextResponse.json(guest);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const data = await req.json();

  const guest = await prisma.guest.update({
    where: { id, weddingId: ctx.weddingId },
    data,
    include: { table: { select: { id: true, name: true } } },
  });

  return NextResponse.json(guest);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  await prisma.guest.delete({ where: { id, weddingId: ctx.weddingId } });
  return NextResponse.json({ success: true });
}
