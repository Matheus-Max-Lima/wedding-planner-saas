import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const guest = await prisma.guest.findUnique({
    where: { rsvpToken: token },
    include: {
      wedding: {
        select: {
          brideName: true,
          groomName: true,
          weddingDate: true,
          venue: true,
          city: true,
        },
      },
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 404 });
  }

  return NextResponse.json({
    id: guest.id,
    name: guest.name,
    plusOne: guest.plusOne,
    plusOneName: guest.plusOneName,
    status: guest.status,
    dietary: guest.dietary,
    rsvpRespondedAt: guest.rsvpRespondedAt,
    wedding: guest.wedding,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const guest = await prisma.guest.findUnique({ where: { rsvpToken: token } });

  if (!guest) {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 404 });
  }

  const { status, dietary, plusOneName } = await req.json();

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: {
      ...(status && { status }),
      ...(dietary !== undefined && { dietary: dietary || null }),
      ...(plusOneName !== undefined && { plusOneName: plusOneName || null }),
      rsvpRespondedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, status: updated.status });
}
