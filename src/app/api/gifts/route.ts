import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const gifts = await prisma.gift.findMany({
    where: { weddingId: result.weddingId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(gifts);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const gift = await prisma.gift.create({
    data: {
      weddingId: result.weddingId,
      name: data.name,
      category: data.category || "Casa",
      store: data.store || null,
      url: data.url || null,
      price: parseFloat(data.price) || 0,
      quantity: parseInt(data.quantity) || 1,
      quantityReceived: parseInt(data.quantityReceived) || 0,
      notes: data.notes || null,
    },
  });
  return NextResponse.json(gift, { status: 201 });
}
