import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const items = await prisma.timelineItem.findMany({
    where: { weddingId: result.weddingId },
    orderBy: [{ order: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const item = await prisma.timelineItem.create({
    data: {
      weddingId: result.weddingId,
      title: data.title,
      description: data.description || null,
      startTime: data.startTime,
      endTime: data.endTime || null,
      location: data.location || null,
      responsible: data.responsible || null,
      category: data.category || "Cerimônia",
      order: data.order || 0,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
