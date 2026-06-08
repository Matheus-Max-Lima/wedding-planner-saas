import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

export async function getSessionAndWedding() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const userId = (session.user as any).id as string;
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) {
    return { error: NextResponse.json({ error: "Wedding not found" }, { status: 404 }) };
  }
  return { userId, weddingId: wedding.id, wedding };
}
