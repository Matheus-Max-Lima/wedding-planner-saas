import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

interface GuestImport {
  name: string;
  email?: string;
  phone?: string;
  side?: string;
  plusOne?: boolean;
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { guests }: { guests: GuestImport[] } = await req.json();

  if (!Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json({ error: "Lista de convidados vazia" }, { status: 400 });
  }

  const data = guests.map((g) => ({
    weddingId: ctx.weddingId,
    name: g.name,
    email: g.email || null,
    phone: g.phone || null,
    side: ["bride", "groom", "both"].includes(g.side || "") ? g.side! : "both",
    status: "pending" as const,
    plusOne: !!g.plusOne,
  }));

  const result = await prisma.guest.createMany({ data, skipDuplicates: false });

  return NextResponse.json({ count: result.count }, { status: 201 });
}
