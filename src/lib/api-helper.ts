import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

export async function getSessionAndWedding() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }
  const userId = (session.user as any).id as string;
  let wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    wedding = await prisma.wedding.create({
      data: {
        userId,
        brideName: user?.name ?? 'A definir',
        groomName: 'A definir',
        weddingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        totalBudget: 0,
      },
    });
  }
  return { userId, wedding, weddingId: wedding.id };
}
