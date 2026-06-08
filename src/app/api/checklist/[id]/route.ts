import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { id } = await params;
  const body = await req.json();

  // Only allow safe fields to be patched
  const allowedFields: Record<string, unknown> = {};
  if (typeof body.completed === "boolean") {
    allowedFields.completed = body.completed;
  }
  if (body.title && typeof body.title === "string") {
    allowedFields.title = body.title.trim();
  }
  if (body.description !== undefined) {
    allowedFields.description = body.description?.trim() || null;
  }
  if (body.category && typeof body.category === "string") {
    allowedFields.category = body.category.trim();
  }
  if (body.priority && ["low", "medium", "high"].includes(body.priority)) {
    allowedFields.priority = body.priority;
  }
  if (body.month !== undefined) {
    const month = Number(body.month);
    if (!isNaN(month) && month >= 1 && month <= 24) {
      allowedFields.month = month;
    }
  }

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo válido para atualizar" },
      { status: 400 }
    );
  }

  const item = await prisma.checklistItem.update({
    where: { id, weddingId: ctx.weddingId },
    data: allowedFields,
  });

  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { id } = await params;
  const body = await req.json();

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json(
      { error: "O título é obrigatório" },
      { status: 400 }
    );
  }

  const month = Number(body.month);
  if (isNaN(month) || month < 1 || month > 24) {
    return NextResponse.json({ error: "Mês inválido" }, { status: 400 });
  }

  const validPriorities = ["low", "medium", "high"];
  const priority =
    body.priority && validPriorities.includes(body.priority)
      ? body.priority
      : "medium";

  const item = await prisma.checklistItem.update({
    where: { id, weddingId: ctx.weddingId },
    data: {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      category: body.category?.trim() || "Geral",
      month,
      priority,
      completed:
        typeof body.completed === "boolean" ? body.completed : undefined,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { id } = await params;

  await prisma.checklistItem.delete({
    where: { id, weddingId: ctx.weddingId },
  });

  return NextResponse.json({ success: true });
}
