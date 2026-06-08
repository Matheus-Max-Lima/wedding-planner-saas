"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  CheckSquare,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  Star,
  Sparkles,
  Clock,
  ShoppingBag,
  ListChecks,
} from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function activityIcon(type: string) {
  switch (type) {
    case "checklist": return "✅";
    case "guest": return "👥";
    case "vendor": return "⭐";
    case "budget": return "💰";
    default: return "📌";
  }
}

interface DashboardData {
  wedding: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    venue?: string;
    city?: string;
    totalBudget: number;
  };
  checklistTotal: number;
  checklistDone: number;
  guestsTotal: number;
  guestsConfirmed: number;
  vendorsTotal: number;
  vendorsHired: number;
  budgetTotal: number;
  budgetSpent: number;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
    link: string;
  }>;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function computeCountdown(weddingDate: string): Countdown {
  const now = Date.now();
  const target = new Date(weddingDate).getTime();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const totalSeconds = Math.floor(diff / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);
  return { days, hours, minutes, seconds, past: false };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [noWedding, setNoWedding] = useState(false);
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (r.status === 401) { router.replace("/login"); return null; }
        if (r.status === 404) { setNoWedding(true); return null; }
        return r.json();
      })
      .then((json: DashboardData | null) => {
        if (json) setData(json);
      })
      .catch(() => {});
  }, [router]);

  // Real-time countdown
  useEffect(() => {
    if (!data?.wedding?.weddingDate) return;
    const tick = () => setCountdown(computeCountdown(data.wedding.weddingDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.wedding?.weddingDate]);

  if (noWedding) {
    return (
      <div style={{ minHeight: "100vh", background: "#fdf8f5", padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "1.5rem", padding: "2.5rem", textAlign: "center", border: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,.06)", maxWidth: 400, width: "100%" }}>
          <div style={{ width: 80, height: 80, background: "#fff1f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Heart style={{ width: 40, height: 40, color: "#fb7185" }} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>Configure seu casamento</h2>
          <p style={{ color: "#78716c", marginBottom: "2rem", lineHeight: 1.6 }}>
            Adicione as informações do seu casamento para começar a planejar o grande dia!
          </p>
          <Link href="/settings" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.75rem 2rem", background: "#f43f5e", color: "white", borderRadius: "0.75rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(244,63,94,.3)" }}>
            <Sparkles style={{ width: 16, height: 16 }} />
            Configurar agora
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#fdf8f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Heart style={{ width: 48, height: 48, color: "#fda4af", margin: "0 auto 1rem", animation: "pulse 2s infinite" }} />
          <p style={{ color: "#78716c" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  const { wedding, checklistTotal, checklistDone, guestsTotal, guestsConfirmed, vendorsTotal, vendorsHired, budgetTotal, budgetSpent, recentActivities } = data;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;
  const budgetPercent = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;
  const guestsPercent = guestsTotal > 0 ? Math.round((guestsConfirmed / guestsTotal) * 100) : 0;
  const vendorsPercent = vendorsTotal > 0 ? Math.round((vendorsHired / vendorsTotal) * 100) : 0;

  const weddingDateFormatted = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(wedding.weddingDate));

  const metricCards = [
    {
      href: "/checklist",
      icon: <CheckSquare style={{ width: 20, height: 20, color: "#10b981" }} />,
      iconBg: "#ecfdf5",
      value: `${checklistPercent}%`,
      label: "Checklist",
      sub: `${checklistDone} de ${checklistTotal} tarefas`,
      barColor: "#34d399",
      barPercent: checklistPercent,
      detail: `${checklistTotal - checklistDone} pendentes`,
    },
    {
      href: "/budget",
      icon: <DollarSign style={{ width: 20, height: 20, color: "#f43f5e" }} />,
      iconBg: "#fff1f2",
      value: formatCurrency(budgetSpent),
      label: "Orçamento usado",
      sub: `de ${formatCurrency(budgetTotal)}`,
      barColor: budgetPercent > 90 ? "#f87171" : budgetPercent > 70 ? "#fbbf24" : "#34d399",
      barPercent: Math.min(budgetPercent, 100),
      detail: `${budgetPercent}% do total`,
    },
    {
      href: "/guests",
      icon: <Users style={{ width: 20, height: 20, color: "#3b82f6" }} />,
      iconBg: "#eff6ff",
      value: String(guestsConfirmed),
      label: "Convidados conf.",
      sub: `de ${guestsTotal} convidados`,
      barColor: "#60a5fa",
      barPercent: guestsPercent,
      detail: guestsTotal > 0 ? `${guestsPercent}% confirmados` : "Nenhum convidado",
    },
    {
      href: "/vendors",
      icon: <Star style={{ width: 20, height: 20, color: "#f59e0b" }} />,
      iconBg: "#fffbeb",
      value: String(vendorsHired),
      label: "Fornecedores",
      sub: "contratados",
      barColor: "#fbbf24",
      barPercent: vendorsPercent,
      detail: `${vendorsTotal} no total`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f5" }}>
      <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }}>

        {/* Welcome Header with real-time countdown */}
        <div style={{
          background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
          borderRadius: "1.5rem",
          padding: "2rem",
          color: "white",
          boxShadow: "0 10px 40px rgba(244,63,94,.25)",
          position: "relative",
          overflow: "hidden",
          marginBottom: "1.5rem",
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 256, height: 256, background: "rgba(255,255,255,.05)", borderRadius: "50%", transform: "translate(30%, -40%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 192, height: 192, background: "rgba(255,255,255,.05)", borderRadius: "50%", transform: "translate(-30%, 40%)" }} />

          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Heart style={{ width: 18, height: 18, color: "#fda4af" }} />
                <span style={{ color: "#fda4af", fontSize: "0.875rem", fontWeight: 500 }}>Bem-vinda de volta!</span>
              </div>
              <h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: "0 0 4px" }}>
                {wedding.brideName} & {wedding.groomName}
              </h1>
              <p style={{ color: "#fecdd3", display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: "0.9rem" }}>
                <Calendar style={{ width: 14, height: 14 }} />
                {weddingDateFormatted}
                {wedding.city ? ` · ${wedding.city}` : ""}
              </p>
            </div>

            {/* Real-time countdown */}
            {countdown && (
              countdown.past ? (
                <div style={{ background: "rgba(255,255,255,.2)", backdropFilter: "blur(8px)", borderRadius: "1rem", padding: "0.75rem 1.25rem", textAlign: "center" }}>
                  <span style={{ fontWeight: 600 }}>🎉 O grande dia chegou! Felicidades!</span>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {[
                    { value: countdown.days, label: countdown.days === 1 ? "dia" : "dias" },
                    { value: countdown.hours, label: countdown.hours === 1 ? "hora" : "horas" },
                    { value: countdown.minutes, label: "min" },
                    { value: countdown.seconds, label: "seg" },
                  ].map((unit) => (
                    <div key={unit.label} style={{ background: "rgba(255,255,255,.2)", backdropFilter: "blur(8px)", borderRadius: "1rem", padding: "0.75rem 1rem", textAlign: "center", minWidth: 64 }}>
                      <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>{String(unit.value).padStart(2, "0")}</div>
                      <div style={{ color: "#fecdd3", fontSize: "0.7rem", marginTop: 4 }}>{unit.label}</div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Metric Cards (clickable) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {metricCards.map((card) => (
            <div
              key={card.href}
              onClick={() => router.push(card.href)}
              style={{ background: "white", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,.06)", cursor: "pointer", transition: "box-shadow .15s, transform .15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,.06)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                {card.icon}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1917" }}>{card.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: 600, marginTop: 2 }}>{card.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#a8a29e" }}>{card.sub}</div>
              <div style={{ marginTop: "0.75rem", background: "#f5f5f4", borderRadius: 999, height: 6 }}>
                <div style={{ height: 6, borderRadius: 999, background: card.barColor, width: `${card.barPercent}%`, transition: "width .5s" }} />
              </div>
              <div style={{ fontSize: "0.7rem", color: "#a8a29e", marginTop: 4 }}>{card.detail}</div>
            </div>
          ))}
        </div>

        {/* Bottom grid: recent activities + quick access */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: "1.5rem", alignItems: "start" }}>

            {/* Recent Activities Feed */}
            <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1c1917", margin: 0 }}>Atividades Recentes</h3>
                <Clock style={{ width: 16, height: 16, color: "#a8a29e" }} />
              </div>

              {recentActivities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <ListChecks style={{ width: 40, height: 40, color: "#d6d3d1", margin: "0 auto 0.75rem" }} />
                  <p style={{ color: "#78716c", fontSize: "0.875rem" }}>Nenhuma atividade ainda.</p>
                  <p style={{ color: "#a8a29e", fontSize: "0.8rem" }}>Comece adicionando tarefas, convidados ou fornecedores!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {recentActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={activity.link}
                      style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.75rem", textDecoration: "none", transition: "background .15s", background: "transparent" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#fdf8f5"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: "1.25rem", lineHeight: 1, marginTop: 2 }}>{activityIcon(activity.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1c1917", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activity.title}</p>
                        <p style={{ fontSize: "0.75rem", color: "#78716c", margin: "2px 0 0" }}>{activity.description}</p>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "#a8a29e", flexShrink: 0, marginTop: 2 }}>{relativeTime(activity.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access */}
            <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1c1917", margin: "0 0 1.25rem" }}>Acesso Rápido</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {[
                  { label: "Checklist", href: "/checklist", emoji: "✅", desc: "Gerencie suas tarefas" },
                  { label: "Orçamento", href: "/budget", emoji: "💰", desc: "Controle seus gastos" },
                  { label: "Convidados", href: "/guests", emoji: "👥", desc: "Lista e confirmações" },
                  { label: "Fornecedores", href: "/vendors", emoji: "⭐", desc: "Seus contratados" },
                  { label: "Cronograma", href: "/timeline", emoji: "🕐", desc: "Planejamento do dia" },
                  { label: "IA Assistente", href: "/ai-assistant", emoji: "🤖", desc: "Tire suas dúvidas" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.75rem", textDecoration: "none", transition: "background .15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#fff1f2"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "1.25rem", width: 28, textAlign: "center" }}>{action.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1c1917" }}>{action.label}</div>
                      <div style={{ fontSize: "0.7rem", color: "#a8a29e" }}>{action.desc}</div>
                    </div>
                    <ArrowRight style={{ width: 14, height: 14, color: "#d6d3d1" }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* More Sections */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1c1917", margin: "0 0 0.75rem" }}>Mais Seções</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
              {[
                { label: "Presentes", href: "/gifts", emoji: "🎁" },
                { label: "Inspirações", href: "/inspiration", emoji: "🌸" },
                { label: "Lua de Mel", href: "/honeymoon", emoji: "🌙" },
                { label: "Música", href: "/music", emoji: "🎵" },
                { label: "Enxoval", href: "/trousseau", emoji: "🏠" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{ background: "white", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #e7e5e4", textAlign: "center", textDecoration: "none", display: "block", transition: "border-color .15s, box-shadow .15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#fda4af"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(244,63,94,.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e7e5e4"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{action.emoji}</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#44403c" }}>{action.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
