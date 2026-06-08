import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const b = await prisma.bachelorette.findUnique({ where: { weddingId: result.weddingId } });
  if (!b) return NextResponse.json({ error: "Despedida não encontrada" }, { status: 404 });
  const data = await req.json();
  const activity = await prisma.bacheloretteActivity.create({
    data: {
      bacheloretteId: b.id,
      title: data.title,
      time: data.time || null,
      description: data.description || null,
      cost: parseFloat(data.cost) || 0,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
