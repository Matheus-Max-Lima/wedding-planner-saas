import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const guest = await prisma.guest.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.guest.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.group !== undefined && { group: data.group }),
      ...(data.plusOne !== undefined && { plusOne: data.plusOne }),
      ...(data.plusOneName !== undefined && { plusOneName: data.plusOneName }),
      ...(data.tableId !== undefined && { tableId: data.tableId }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.rsvpDate !== undefined && { rsvpDate: data.rsvpDate ? new Date(data.rsvpDate) : null }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const guest = await prisma.guest.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.guest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
