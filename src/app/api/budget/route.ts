import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const items = await prisma.budgetItem.findMany({
    where: { weddingId: result.weddingId },
    include: { installments: true },
    orderBy: { createdAt: "desc" },
  });
  const wedding = result.wedding;
  const totalEstimated = items.reduce((s, i) => s + i.estimatedCost, 0);
  const totalActual = items.reduce((s, i) => s + i.actualCost, 0);
  const totalPaid = items.filter(i => i.paid).reduce((s, i) => s + i.actualCost, 0);
  return NextResponse.json({ items, totalBudget: wedding.totalBudget, totalEstimated, totalActual, totalPaid });
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const item = await prisma.budgetItem.create({
    data: {
      weddingId: result.weddingId,
      category: data.category,
      description: data.description,
      estimatedCost: parseFloat(data.estimatedCost) || 0,
      actualCost: parseFloat(data.actualCost) || 0,
      paid: data.paid || false,
      vendor: data.vendor || null,
      notes: data.notes || null,
    },
    include: { installments: true },
  });
  return NextResponse.json(item, { status: 201 });
}
