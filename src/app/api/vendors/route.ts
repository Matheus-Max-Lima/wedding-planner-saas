import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const vendors = await prisma.vendor.findMany({
    where: { weddingId: result.weddingId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(vendors);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const vendor = await prisma.vendor.create({
    data: {
      weddingId: result.weddingId,
      name: data.name,
      category: data.category,
      contactName: data.contactName || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      price: parseFloat(data.price) || 0,
      paid: data.paid || false,
      contractSigned: data.contractSigned || false,
      rating: data.rating ? parseInt(data.rating) : null,
      notes: data.notes || null,
      status: data.status || "PROSPECT",
    },
  });
  return NextResponse.json(vendor, { status: 201 });
}
