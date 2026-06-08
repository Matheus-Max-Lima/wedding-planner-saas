import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const honeymoon = await prisma.honeymoon.findUnique({
    where: { weddingId: result.weddingId },
    include: { activities: { orderBy: { date: "asc" } } },
  });
  return NextResponse.json(honeymoon);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const existing = await prisma.honeymoon.findUnique({ where: { weddingId: result.weddingId } });
  if (existing) {
    const updated = await prisma.honeymoon.update({
      where: { weddingId: result.weddingId },
      data: {
        destination: data.destination,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: parseFloat(data.budget) || 0,
        notes: data.notes || null,
      },
      include: { activities: true },
    });
    return NextResponse.json(updated);
  }
  const honeymoon = await prisma.honeymoon.create({
    data: {
      weddingId: result.weddingId,
      destination: data.destination,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      budget: parseFloat(data.budget) || 0,
      notes: data.notes || null,
    },
    include: { activities: true },
  });
  return NextResponse.json(honeymoon, { status: 201 });
}
