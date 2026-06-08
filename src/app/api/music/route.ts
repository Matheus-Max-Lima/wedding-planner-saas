import { NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;
  const playlists = await prisma.playlist.findMany({
    where: { weddingId: ctx.weddingId },
    include: { tracks: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(playlists);
}
