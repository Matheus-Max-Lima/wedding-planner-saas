import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const guests = await prisma.guest.findMany({
    where: { weddingId: result.weddingId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(guests);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const guest = await prisma.guest.create({
    data: {
      weddingId: result.weddingId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status || "PENDING",
      group: data.group || null,
      plusOne: data.plusOne || false,
      plusOneName: data.plusOneName || null,
      tableId: data.tableId || null,
      notes: data.notes || null,
    },
  });
  return NextResponse.json(guest, { status: 201 });
}
