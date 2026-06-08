import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const activity = await prisma.bacheloretteActivity.findUnique({ where: { id }, include: { bachelorette: true } });
  if (!activity || activity.bachelorette.weddingId !== result.weddingId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.bacheloretteActivity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
