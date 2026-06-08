import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAndWedding } from "@/lib/api-helper";
import bcrypt from "bcryptjs";

export async function GET() {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return NextResponse.json({ user, wedding: result.wedding });
}

export async function PATCH(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const data = await req.json();
  if (data.type === "profile") {
    const user = await prisma.user.update({
      where: { id: result.userId },
      data: {
        ...(data.name && { name: data.name }),
      },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ user });
  }
  if (data.type === "password") {
    const user = await prisma.user.findUnique({ where: { id: result.userId } });
    if (!user?.password) return NextResponse.json({ error: "Usuário sem senha" }, { status: 400 });
    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    const hashed = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: result.userId }, data: { password: hashed } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
