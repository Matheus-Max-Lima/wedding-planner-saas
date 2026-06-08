import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { id } = await params;

  const guest = await prisma.guest.findFirst({
    where: { id, weddingId: ctx.weddingId },
  });

  if (!guest) {
    return NextResponse.json({ error: "Convidado não encontrado" }, { status: 404 });
  }

  const token = guest.rsvpToken || crypto.randomUUID();

  if (!guest.rsvpToken) {
    await prisma.guest.update({ where: { id }, data: { rsvpToken: token } });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/rsvp/${token}`;

  return NextResponse.json({ token, link });
}
