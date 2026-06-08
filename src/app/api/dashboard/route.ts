import { NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { weddingId } = ctx;

  const [wedding, checklistItems, guests, budgetItems, vendors] =
    await Promise.all([
      prisma.wedding.findUnique({ where: { id: weddingId } }),
      prisma.checklistItem.findMany({ where: { weddingId } }),
      prisma.guest.findMany({ where: { weddingId } }),
      prisma.budgetItem.findMany({ where: { weddingId } }),
      prisma.vendor.findMany({ where: { weddingId } }),
    ]);

  if (!wedding) {
    return NextResponse.json(
      { error: "Casamento não encontrado" },
      { status: 404 }
    );
  }

  const checklistTotal = checklistItems.length;
  const checklistDone = checklistItems.filter((i) => i.completed).length;
  const guestsTotal = guests.length;
  const guestsConfirmed = guests.filter((g) => g.status === "confirmed").length;
  const vendorsTotal = vendors.length;
  const vendorsHired = vendors.filter((v) => v.status === "hired").length;
  const budgetTotal = wedding.totalBudget;
  const budgetSpent = budgetItems.reduce((sum, b) => sum + b.actualCost, 0);

  // Recent activities: last 10 items created across tables
  const recentChecklist = checklistItems
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      type: "checklist" as const,
      title: i.title,
      description: `Tarefa adicionada ao checklist`,
      createdAt: i.createdAt,
      link: "/checklist",
    }));

  const recentGuests = guests
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      type: "guest" as const,
      title: g.name,
      description: `Convidado adicionado`,
      createdAt: g.createdAt,
      link: "/guests",
    }));

  const recentVendors = vendors
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      type: "vendor" as const,
      title: v.name,
      description: `Fornecedor adicionado — ${v.category}`,
      createdAt: v.createdAt,
      link: "/vendors",
    }));

  const recentBudget = budgetItems
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      type: "budget" as const,
      title: b.title,
      description: `Item de orçamento adicionado`,
      createdAt: b.createdAt,
      link: "/budget",
    }));

  const recentActivities = [
    ...recentChecklist,
    ...recentGuests,
    ...recentVendors,
    ...recentBudget,
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return NextResponse.json({
    wedding: {
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      weddingDate: wedding.weddingDate,
      venue: wedding.venue,
      city: wedding.city,
      totalBudget: wedding.totalBudget,
    },
    checklistTotal,
    checklistDone,
    guestsTotal,
    guestsConfirmed,
    vendorsTotal,
    vendorsHired,
    budgetTotal,
    budgetSpent,
    recentActivities,
  });
}
