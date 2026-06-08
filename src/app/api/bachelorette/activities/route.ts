import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const bachelorette = await prisma.bachelorette.findUnique({ where: { weddingId: ctx.weddingId } });
  if (!bachelorette) return NextResponse.json({ error: "Despedida não encontrada" }, { status: 404 });
  const activity = await prisma.bacheloretteActivity.create({
    data: { ...data, bacheloretteId: bachelorette.id },
  });
  return NextResponse.json(activity);
}
