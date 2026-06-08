import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const activity = await prisma.honeymoonActivity.findUnique({ where: { id }, include: { honeymoon: true } });
  if (!activity || activity.honeymoon.weddingId !== result.weddingId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.honeymoonActivity.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
      ...(data.time !== undefined && { time: data.time }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.cost !== undefined && { cost: parseFloat(data.cost) }),
      ...(data.booked !== undefined && { booked: data.booked }),
      ...(data.confirmationCode !== undefined && { confirmationCode: data.confirmationCode }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const activity = await prisma.honeymoonActivity.findUnique({ where: { id }, include: { honeymoon: true } });
  if (!activity || activity.honeymoon.weddingId !== result.weddingId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.honeymoonActivity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
