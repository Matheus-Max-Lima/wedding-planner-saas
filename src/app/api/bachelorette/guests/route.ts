import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const b = await prisma.bachelorette.findUnique({ where: { weddingId: result.weddingId } });
  if (!b) return NextResponse.json({ error: "Despedida não encontrada" }, { status: 404 });
  const data = await req.json();
  const guest = await prisma.bacheloretteGuest.create({
    data: {
      bacheloretteId: b.id,
      name: data.name,
      confirmed: data.confirmed || false,
      paid: data.paid || false,
      amountPaid: parseFloat(data.amountPaid) || 0,
    },
  });
  return NextResponse.json(guest, { status: 201 });
}
