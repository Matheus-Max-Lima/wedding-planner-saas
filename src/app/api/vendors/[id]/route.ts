import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const vendor = await prisma.vendor.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.vendor.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.contactName !== undefined && { contactName: data.contactName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.price !== undefined && { price: parseFloat(data.price) }),
      ...(data.paid !== undefined && { paid: data.paid }),
      ...(data.contractSigned !== undefined && { contractSigned: data.contractSigned }),
      ...(data.rating !== undefined && { rating: data.rating ? parseInt(data.rating) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { id } = await params;
  const vendor = await prisma.vendor.findFirst({ where: { id, weddingId: result.weddingId } });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
