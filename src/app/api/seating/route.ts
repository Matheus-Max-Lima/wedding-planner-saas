import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const tables = await prisma.table.findMany({
    where: { weddingId: ctx.weddingId },
    include: { guests: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tables);
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const table = await prisma.table.create({
    data: { ...data, weddingId: ctx.weddingId },
    include: { guests: true },
  });
  return NextResponse.json(table);
}
