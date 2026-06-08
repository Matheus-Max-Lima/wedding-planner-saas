import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const tables = await prisma.table.findMany({
    where: { weddingId: result.weddingId },
    include: { guests: { select: { id: true, name: true, status: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tables);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const table = await prisma.table.create({
    data: {
      weddingId: result.weddingId,
      name: data.name,
      capacity: parseInt(data.capacity) || 8,
      shape: data.shape || "ROUND",
      notes: data.notes || null,
    },
    include: { guests: true },
  });
  return NextResponse.json(table, { status: 201 });
}
