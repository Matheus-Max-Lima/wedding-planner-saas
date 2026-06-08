import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const playlists = await prisma.playlist.findMany({
    where: { weddingId: result.weddingId },
    include: { tracks: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(playlists);
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  const playlist = await prisma.playlist.create({
    data: {
      weddingId: result.weddingId,
      name: data.name,
      description: data.description || null,
    },
    include: { tracks: true },
  });
  return NextResponse.json(playlist, { status: 201 });
}
