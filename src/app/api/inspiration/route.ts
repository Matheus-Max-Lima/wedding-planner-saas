import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const items = await prisma.inspiration.findMany({
    where: { weddingId: ctx.weddingId },
    orderBy: [{ favorite: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const item = await prisma.inspiration.create({
    data: { ...data, weddingId: ctx.weddingId },
  });
  return NextResponse.json(item);
}
