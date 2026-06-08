import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const honeymoon = await prisma.honeymoon.findUnique({
    where: { weddingId: ctx.weddingId },
    include: { activities: { orderBy: { date: "asc" } } },
  });
  return NextResponse.json(honeymoon);
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const honeymoon = await prisma.honeymoon.upsert({
    where: { weddingId: ctx.weddingId },
    update: data,
    create: { ...data, weddingId: ctx.weddingId },
    include: { activities: true },
  });
  return NextResponse.json(honeymoon);
}

export async function PUT(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const honeymoon = await prisma.honeymoon.upsert({
    where: { weddingId: ctx.weddingId },
    update: data,
    create: { ...data, weddingId: ctx.weddingId },
    include: { activities: { orderBy: { date: "asc" } } },
  });
  return NextResponse.json(honeymoon);
}
