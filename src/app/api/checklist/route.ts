import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const items = await prisma.checklistItem.findMany({
    where: { weddingId: result.weddingId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const item = await prisma.checklistItem.create({
    data: {
      weddingId: result.weddingId,
      title: data.title,
      category: data.category || "Outros",
      completed: false,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      order: data.order || 0,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
