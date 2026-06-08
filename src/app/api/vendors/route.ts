import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const vendors = await prisma.vendor.findMany({
    where: { weddingId: ctx.weddingId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(vendors);
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const data = await req.json();
  const vendor = await prisma.vendor.create({ data: { ...data, weddingId: ctx.weddingId } });
  return NextResponse.json(vendor);
}
