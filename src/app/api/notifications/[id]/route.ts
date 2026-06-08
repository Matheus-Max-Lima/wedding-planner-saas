import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!notification || notification.userId !== userId) {
    return NextResponse.json(
      { error: "Notificação não encontrada" },
      { status: 404 }
    );
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!notification || notification.userId !== userId) {
    return NextResponse.json(
      { error: "Notificação não encontrada" },
      { status: 404 }
    );
  }

  await prisma.notification.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
