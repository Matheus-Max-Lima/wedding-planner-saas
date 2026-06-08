import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const items = await prisma.inspiration.findMany({
    where: { weddingId: result.weddingId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const item = await prisma.inspiration.create({
    data: {
      weddingId: result.weddingId,
      title: data.title,
      category: data.category || "Decoração",
      imageUrl: data.imageUrl || null,
      description: data.description || null,
      tags: data.tags || [],
      favorite: data.favorite || false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
