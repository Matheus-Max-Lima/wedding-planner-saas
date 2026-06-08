"use client";
import { useEffect, useState } from "react";
import { Heart, Calendar, Users, DollarSign, CheckSquare, Star, Clock } from "lucide-react";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  wedding: { brideName: string; groomName: string; weddingDate: string; venue: string; city: string; totalBudget: number };
  checklistStats: { total: number; completed: number };
  budgetStats: { totalBudget: number; totalActual: number; totalPaid: number };
  guestStats: { total: number; confirmed: number; declined: number };
  vendorStats: { total: number; contracted: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [wedding, checklist, budget, guests, vendors] = await Promise.all([
          fetch("/api/wedding").then(r => r.json()),
          fetch("/api/checklist").then(r => r.json()),
          fetch("/api/budget").then(r => r.json()),
          fetch("/api/guests").then(r => r.json()),
          fetch("/api/vendors").then(r => r.json()),
        ]);
        setData({
          wedding,
          checklistStats: {
            total: checklist.length,
            completed: checklist.filter((i: any) => i.completed).length,
          },
          budgetStats: {
            totalBudget: budget.totalBudget,
            totalActual: budget.totalActual,
            totalPaid: budget.totalPaid,
          },
          guestStats: {
            total: guests.length,
            confirmed: guests.filter((g: any) => g.status === "CONFIRMED").length,
            declined: guests.filter((g: any) => g.status === "DECLINED").length,
          },
          vendorStats: {
            total: vendors.length,
            contracted: vendors.filter((v: any) => v.contractSigned).length,
          },
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" />
    </div>
  );

  if (!data) return null;

  const days = data.wedding.weddingDate ? daysUntil(data.wedding.weddingDate) : null;
  const checklistPct = data.checklistStats.total > 0
    ? Math.round((data.checklistStats.completed / data.checklistStats.total) * 100) : 0;
  const budgetPct = data.budgetStats.totalBudget > 0
    ? Math.round((data.budgetStats.totalActual / data.budgetStats.totalBudget) * 100) : 0;

  const stats = [
    { label: "Convidados confirmados", value: `${data.guestStats.confirmed}/${data.guestStats.total}`, icon: Users, color: "text-blue-500", bg: "bg-blue-50", href: "/guests" },
    { label: "Orçamento utilizado", value: formatCurrency(data.budgetStats.totalActual), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50", href: "/budget" },
    { label: "Tarefas concluídas", value: `${data.checklistStats.completed}/${data.checklistStats.total}`, icon: CheckSquare, color: "text-rose-500", bg: "bg-rose-50", href: "/checklist" },
    { label: "Fornecedores", value: `${data.vendorStats.contracted}/${data.vendorStats.total} contratados`, icon: Star, color: "text-amber-500", bg: "bg-amber-50", href: "/vendors" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">
          Ola, {data.wedding.brideName}! 💕
        </h1>
        <p className="text-stone-500 mt-1">Aqui esta o resumo do seu planejamento</p>
      </div>

      {/* Countdown */}
      {days !== null && (
        <div className="rounded-2xl text-white p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)" }}>
          <div className="absolute top-0 right-0 opacity-10">
            <Heart className="w-40 h-40 fill-white" style={{ transform: "translate(20px, -20px)" }} />
          </div>
          <div className="relative">
            <p className="text-rose-100 text-sm font-medium uppercase tracking-wide">Contagem regressiva</p>
            <div className="mt-2">
              {days > 0 ? (
                <>
                  <span className="text-5xl font-bold">{days}</span>
                  <span className="text-2xl ml-2 text-rose-100">dias</span>
                  <p className="text-rose-100 mt-1">para o seu grande dia!</p>
                </>
              ) : days === 0 ? (
                <p className="text-3xl font-bold">Hoje e o seu casamento! 🎉</p>
              ) : (
                <p className="text-2xl font-bold">Casamento realizado!</p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-rose-100 text-sm">
              <Calendar className="w-4 h-4" />
              {data.wedding.weddingDate && formatDate(data.wedding.weddingDate)}
              {data.wedding.venue && ` · ${data.wedding.venue}`}
              {data.wedding.city && `, ${data.wedding.city}`}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}
            className="bg-white rounded-2xl p-4 border border-stone-100 hover:border-rose-200 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-lg font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-rose-500" />
              <span className="font-semibold text-stone-700">Checklist</span>
            </div>
            <span className="text-sm font-medium text-rose-500">{checklistPct}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mb-2">
            <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${checklistPct}%` }} />
          </div>
          <p className="text-xs text-stone-500">{data.checklistStats.completed} de {data.checklistStats.total} tarefas concluidas</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-stone-700">Orcamento</span>
            </div>
            <span className="text-sm font-medium text-emerald-600">{budgetPct}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, budgetPct)}%` }} />
          </div>
          <p className="text-xs text-stone-500">
            {formatCurrency(data.budgetStats.totalActual)} de {formatCurrency(data.budgetStats.totalBudget)} utilizados
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400" /> Acesso rapido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/checklist", label: "Checklist", emoji: "✅" },
            { href: "/budget", label: "Orcamento", emoji: "💰" },
            { href: "/guests", label: "Convidados", emoji: "👥" },
            { href: "/vendors", label: "Fornecedores", emoji: "⭐" },
            { href: "/timeline", label: "Cronograma", emoji: "⏰" },
            { href: "/music", label: "Musica", emoji: "🎵" },
            { href: "/honeymoon", label: "Lua de Mel", emoji: "✈️" },
            { href: "/ai-assistant", label: "IA Valentina", emoji: "🤖" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 hover:bg-rose-50 hover:text-rose-600 text-stone-600 transition-all text-sm font-medium"
            >
              <span className="text-base">{link.emoji}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
