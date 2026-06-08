import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const bachelorette = await prisma.bachelorette.findUnique({
    where: { weddingId: ctx.weddingId },
    include: {
      activities: { orderBy: { order: "asc" } },
      guests: { orderBy: { name: "asc" } },
    },
  });
  return NextResponse.json(bachelorette);
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const bachelorette = await prisma.bachelorette.upsert({
    where: { weddingId: ctx.weddingId },
    update: data,
    create: { ...data, weddingId: ctx.weddingId },
    include: { activities: true, guests: true },
  });
  return NextResponse.json(bachelorette);
}

export async function PUT(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const bachelorette = await prisma.bachelorette.upsert({
    where: { weddingId: ctx.weddingId },
    update: data,
    create: { ...data, weddingId: ctx.weddingId },
    include: {
      activities: { orderBy: { order: "asc" } },
      guests: { orderBy: { name: "asc" } },
    },
  });
  return NextResponse.json(bachelorette);
}
