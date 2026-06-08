import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  return NextResponse.json(wedding);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const data = await req.json();
  const wedding = await prisma.wedding.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  return NextResponse.json(wedding);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const data = await req.json();
  const wedding = await prisma.wedding.update({
    where: { userId },
    data,
  });
  return NextResponse.json(wedding);
}
