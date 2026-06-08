import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const honeymoon = await prisma.honeymoon.findUnique({ where: { weddingId: ctx.weddingId } });
  if (!honeymoon) return NextResponse.json({ error: "Lua de mel não encontrada" }, { status: 404 });
  const activity = await prisma.honeymoonActivity.create({
    data: { ...data, honeymoonId: honeymoon.id },
  });
  return NextResponse.json(activity);
}
