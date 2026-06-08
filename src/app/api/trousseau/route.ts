import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const items = await prisma.trousseauItem.findMany({
    where: { weddingId: result.weddingId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const item = await prisma.trousseauItem.create({
    data: {
      weddingId: result.weddingId,
      name: data.name,
      category: data.category || "Cama",
      quantity: parseInt(data.quantity) || 1,
      quantityOwned: parseInt(data.quantityOwned) || 0,
      estimatedPrice: parseFloat(data.estimatedPrice) || 0,
      store: data.store || null,
      priority: data.priority || "MEDIUM",
      purchased: data.purchased || false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
