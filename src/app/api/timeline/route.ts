import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const items = await prisma.timelineItem.findMany({
    where: { weddingId: ctx.weddingId },
    orderBy: [{ order: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const item = await prisma.timelineItem.create({ data: { ...data, weddingId: ctx.weddingId } });
  return NextResponse.json(item);
}
