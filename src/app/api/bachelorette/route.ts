import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const bachelorette = await prisma.bachelorette.findUnique({
    where: { weddingId: result.weddingId },
    include: {
      activities: { orderBy: { createdAt: "asc" } },
      bacheloretteGuests: { orderBy: { name: "asc" } },
    },
  });
  return NextResponse.json(bachelorette);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const existing = await prisma.bachelorette.findUnique({ where: { weddingId: result.weddingId } });
  if (existing) {
    const updated = await prisma.bachelorette.update({
      where: { weddingId: result.weddingId },
      data: {
        theme: data.theme || null,
        date: data.date ? new Date(data.date) : null,
        location: data.location || null,
        budget: parseFloat(data.budget) || 0,
        notes: data.notes || null,
      },
      include: { activities: true, bacheloretteGuests: true },
    });
    return NextResponse.json(updated);
  }
  const bachelorette = await prisma.bachelorette.create({
    data: {
      weddingId: result.weddingId,
      theme: data.theme || null,
      date: data.date ? new Date(data.date) : null,
      location: data.location || null,
      budget: parseFloat(data.budget) || 0,
      notes: data.notes || null,
    },
    include: { activities: true, bacheloretteGuests: true },
  });
  return NextResponse.json(bachelorette, { status: 201 });
}
