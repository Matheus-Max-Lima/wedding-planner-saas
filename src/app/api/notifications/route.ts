import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const { title, message, type = "info", link } = body;

  if (!title || !message) {
    return NextResponse.json(
      { error: "title e message são obrigatórios" },
      { status: 400 }
    );
  }

  const notification = await prisma.notification.create({
    data: { userId, title, message, type, link },
  });

  return NextResponse.json(notification, { status: 201 });
}
