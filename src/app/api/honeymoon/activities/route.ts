import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const honeymoon = await prisma.honeymoon.findUnique({ where: { weddingId: result.weddingId } });
  if (!honeymoon) return NextResponse.json({ error: "Lua de mel não encontrada" }, { status: 404 });
  const data = await req.json();
  const activity = await prisma.honeymoonActivity.create({
    data: {
      honeymoonId: honeymoon.id,
      title: data.title,
      date: data.date ? new Date(data.date) : null,
      time: data.time || null,
      description: data.description || null,
      cost: parseFloat(data.cost) || 0,
      booked: data.booked || false,
      confirmationCode: data.confirmationCode || null,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
