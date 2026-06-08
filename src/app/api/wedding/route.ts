import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  return NextResponse.json(result.wedding);
}

export async function PATCH(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const updated = await prisma.wedding.update({
    where: { id: result.weddingId },
    data: {
      ...(data.brideName !== undefined && { brideName: data.brideName }),
      ...(data.groomName !== undefined && { groomName: data.groomName }),
      ...(data.weddingDate !== undefined && { weddingDate: data.weddingDate ? new Date(data.weddingDate) : null }),
      ...(data.venue !== undefined && { venue: data.venue }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.totalBudget !== undefined && { totalBudget: parseFloat(data.totalBudget) }),
      ...(data.style !== undefined && { style: data.style }),
      ...(data.guestCount !== undefined && { guestCount: parseInt(data.guestCount) }),
    },
  });
  return NextResponse.json(updated);
}
