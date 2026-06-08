"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  Calendar,
  FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Installment {
  id: string;
  budgetItemId: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string | null;
  notes?: string | null;
}

interface BudgetItem {
  id: string;
  category: string;
  title: string;
  estimatedCost: number;
  actualCost: number;
  paid: number;
  vendor?: string | null;
  notes?: string | null;
  installments: Installment[];
}

interface BudgetData {
  items: BudgetItem[];
  totalBudget: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Buffet",
  "Fotografia",
  "Decoração",
  "Vestido",
  "Música",
  "Local",
  "Convites",
  "Buquê",
  "Outros",
];

const CATEGORY_COLORS: Record<string, string> = {
  Buffet: "#f43f5e",
  Fotografia: "#ec4899",
  "Decoração": "#d4af37",
  Vestido: "#e879f9",
  "Música": "#8b5cf6",
  Local: "#3b82f6",
  Convites: "#10b981",
  "Buquê": "#f97316",
  Outros: "#6b7280",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.min(100, (a / b) * 100));

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = {
  title: "",
  category: CATEGORIES[0],
  estimatedCost: "",
  actualCost: "",
  paid: "",
  vendor: "",
  notes: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = "rose",
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "rose" | "gold" | "green" | "red";
  icon: React.ElementType;
}) {
  const palette = {
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    gold: "bg-amber-50 text-amber-600 border-amber-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
  }[color];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-center shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${palette}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xl font-bold text-stone-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const color = CATEGORY_COLORS[cat] || "#6b7280";
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: color + "20", color }}
    >
      {cat}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [data, setData] = useState<BudgetData>({ items: [], totalBudget: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [brideName, setBrideName] = useState("Noiva");
  const [groomName, setGroomName] = useState("Noivo");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetRes, settingsRes] = await Promise.all([
        fetch("/api/budget"),
        fetch("/api/settings"),
      ]);
      const json = await budgetRes.json();
      setData(json);
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setBrideName(settings.wedding?.brideName || settings.brideName || "Noiva");
        setGroomName(settings.wedding?.groomName || settings.groomName || "Noivo");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Inject print styles
  useEffect(() => {
    const id = "budget-print-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media print {
        nav, aside, header, [data-sidebar],
        .budget-no-print { display: none !important; }

        body { background: white !important; color: black !important; font-family: sans-serif; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        #budget-print-header {
          display: block !important;
          text-align: center;
          padding: 16px 0 20px;
          border-bottom: 2px solid #000;
          margin-bottom: 20px;
        }
        #budget-print-header h1 { font-size: 20pt; margin: 0 0 4px; }
        #budget-print-header p { font-size: 10pt; color: #555; margin: 0; }

        #budget-print-table {
          display: block !important;
          width: 100%;
        }
        #budget-print-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }
        #budget-print-table th {
          background: #f5f5f5;
          border: 1px solid #ccc;
          padding: 6px 8px;
          text-align: left;
          font-weight: bold;
        }
        #budget-print-table td {
          border: 1px solid #ddd;
          padding: 5px 8px;
          vertical-align: middle;
        }
        #budget-print-table tr:nth-child(even) td { background: #fafafa; }
        #budget-print-table .tfoot td {
          font-weight: bold;
          border-top: 2px solid #000;
          background: #f0f0f0;
        }
        #budget-print-table .col-num { text-align: right; }
        #budget-print-table .positive { color: #000; }
        #budget-print-table .negative { color: #c00; }
      }
      #budget-print-header { display: none; }
      #budget-print-table { display: none; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // ── Derived numbers ────────────────────────────────────────────────────────

  const totalEstimated = data.items.reduce((s, i) => s + i.estimatedCost, 0);
  const totalActual = data.items.reduce((s, i) => s + i.actualCost, 0);
  const totalPaid = data.items.reduce((s, i) => s + i.paid, 0);
  const remaining = data.totalBudget - totalActual;
  const spentPct = pct(totalActual, data.totalBudget);

  // Chart data — one bar per category
  const chartData = CATEGORIES.map((cat) => {
    const items = data.items.filter((i) => i.category === cat);
    return {
      cat,
      estimado: items.reduce((s, i) => s + i.estimatedCost, 0),
      real: items.reduce((s, i) => s + i.actualCost, 0),
    };
  }).filter((d) => d.estimado > 0 || d.real > 0);

  // Upcoming installments (unpaid, within next 60 days)
  const now = new Date();
  const upcoming = data.items
    .flatMap((item) =>
      item.installments
        .filter((inst) => !inst.paid)
        .map((inst) => ({ ...inst, itemTitle: item.title, itemCategory: item.category }))
    )
    .filter((inst) => {
      const d = new Date(inst.dueDate);
      const diff = (d.getTime() - now.getTime()) / 86400000;
      return diff >= -1 && diff <= 60;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // ── Handlers ───────────────────────────────────────────────────────────────

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(item: BudgetItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      estimatedCost: String(item.estimatedCost),
      actualCost: String(item.actualCost),
      paid: String(item.paid),
      vendor: item.vendor || "",
      notes: item.notes || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        estimatedCost: parseFloat(form.estimatedCost) || 0,
        actualCost: parseFloat(form.actualCost) || 0,
        paid: parseFloat(form.paid) || 0,
        vendor: form.vendor || null,
        notes: form.notes || null,
      };

      if (editingId) {
        const res = await fetch(`/api/budget/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setData((prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === editingId ? updated : i)),
        }));
      } else {
        const res = await fetch("/api/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setData((prev) => ({ ...prev, items: [...prev.items, created] }));
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
    setDeleteConfirm(null);
  }

  async function saveTotalBudget() {
    const val = parseFloat(budgetInput) || 0;
    await fetch("/api/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalBudget: val }),
    });
    setData((prev) => ({ ...prev, totalBudget: val }));
    setEditBudget(false);
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExportPDF() {
    document.title = `Orçamento - ${brideName} & ${groomName}`;
    const header = document.getElementById("budget-print-header");
    const table = document.getElementById("budget-print-table");
    if (header) header.style.display = "block";
    if (table) table.style.display = "block";
    window.print();
    setTimeout(() => {
      document.title = "Orçamento";
      if (header) header.style.display = "none";
      if (table) table.style.display = "none";
    }, 500);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Carregando orçamento…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5] pb-20">
      {/* Print header */}
      <div id="budget-print-header" style={{ display: "none" }}>
        <h1>Até o Altar — Orçamento de {brideName} &amp; {groomName}</h1>
        <p>Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      {/* Print table */}
      <div id="budget-print-table" style={{ display: "none" }}>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Título</th>
              <th className="col-num">Estimado</th>
              <th className="col-num">Realizado</th>
              <th className="col-num">Pago</th>
              <th className="col-num">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => {
              const diff = item.actualCost - item.estimatedCost;
              return (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>{item.title}{item.vendor ? ` — ${item.vendor}` : ""}</td>
                  <td className="col-num">{fmt(item.estimatedCost)}</td>
                  <td className="col-num">{fmt(item.actualCost)}</td>
                  <td className="col-num">{fmt(item.paid)}</td>
                  <td className={`col-num ${diff > 0 ? "negative" : "positive"}`}>
                    {diff > 0 ? "+" : ""}{fmt(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot">
              <td colSpan={2}>Total Geral</td>
              <td className="col-num">{fmt(data.items.reduce((s, i) => s + i.estimatedCost, 0))}</td>
              <td className="col-num">{fmt(data.items.reduce((s, i) => s + i.actualCost, 0))}</td>
              <td className="col-num">{fmt(data.items.reduce((s, i) => s + i.paid, 0))}</td>
              <td className="col-num">{fmt(data.items.reduce((s, i) => s + (i.actualCost - i.estimatedCost), 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Orçamento</h1>
            <p className="text-stone-400 text-sm mt-0.5">Controle financeiro do seu casamento</p>
          </div>
          <div className="flex items-center gap-2 budget-no-print">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-white border border-stone-200 text-stone-600 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors hover:bg-stone-50 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Orçamento total"
            value={fmt(data.totalBudget)}
            icon={DollarSign}
            color="rose"
          />
          <StatCard
            label="Estimado"
            value={fmt(totalEstimated)}
            icon={TrendingUp}
            color="gold"
          />
          <StatCard
            label="Saldo restante"
            value={fmt(remaining)}
            sub={remaining < 0 ? "Acima do orçamento!" : undefined}
            icon={remaining < 0 ? AlertCircle : Check}
            color={remaining < 0 ? "red" : "green"}
          />
          <StatCard label="Pago" value={fmt(totalPaid)} icon={Check} color="green" />
        </div>

        {/* Budget progress */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-stone-700">Progresso do orçamento</h2>
              <p className="text-sm text-stone-400">
                {fmt(totalActual)} gastos de {fmt(data.totalBudget)}
              </p>
            </div>
            {editBudget ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Novo orçamento"
                />
                <button
                  onClick={saveTotalBudget}
                  className="bg-rose-500 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-rose-600 transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditBudget(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditBudget(true);
                  setBudgetInput(String(data.totalBudget));
                }}
                className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar orçamento
              </button>
            )}
          </div>

          <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                spentPct >= 100 ? "bg-red-500" : spentPct >= 80 ? "bg-amber-400" : "bg-rose-500"
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-1.5">
            <span>{spentPct.toFixed(1)}% utilizado</span>
            <span>Pago: {fmt(totalPaid)}</span>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <h2 className="font-semibold text-stone-700 mb-6">Gasto por categoria</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ee" vertical={false} />
                <XAxis
                  dataKey="cat"
                  tick={{ fontSize: 11, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v, name) => [
                    fmt(Number(v)),
                    name === "estimado" ? "Estimado" : "Real",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f1f0ee",
                    fontSize: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                  }}
                />
                <Bar dataKey="estimado" radius={[4, 4, 0, 0]} name="estimado">
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.cat}
                      fill={(CATEGORY_COLORS[entry.cat] || "#6b7280") + "40"}
                      stroke={CATEGORY_COLORS[entry.cat] || "#6b7280"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
                <Bar dataKey="real" radius={[4, 4, 0, 0]} name="real">
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.cat}
                      fill={CATEGORY_COLORS[entry.cat] || "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 justify-center mt-2">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="w-3 h-3 rounded-sm bg-rose-200 border border-rose-500" />
                Estimado
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                Real
              </span>
            </div>
          </div>
        )}

        {/* Add / Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-md ring-2 ring-rose-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-stone-700">
                {editingId ? "Editar item" : "Novo item de orçamento"}
              </h2>
              <button onClick={cancelForm} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Título *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="Ex: Buffet principal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Fornecedor
                  </label>
                  <input
                    value={form.vendor}
                    onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Custo estimado (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedCost}
                    onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Custo real (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.actualCost}
                    onChange={(e) => setForm((f) => ({ ...f, actualCost: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Valor pago (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.paid}
                    onChange={(e) => setForm((f) => ({ ...f, paid: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="0,00"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50 resize-none"
                    placeholder="Detalhes, condições, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2.5 text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando…" : editingId ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items list */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between">
            <h2 className="font-semibold text-stone-700">
              Itens do orçamento{" "}
              <span className="text-rose-500 font-bold">{data.items.length}</span>
            </h2>
          </div>

          {data.items.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum item ainda</p>
              <p className="text-sm mt-1">Clique em "Adicionar item" para começar</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {data.items.map((item) => {
                const isExpanded = expandedIds.has(item.id);
                const balance = item.actualCost - item.paid;
                const paidPct = pct(item.paid, item.actualCost || item.estimatedCost);

                return (
                  <div key={item.id}>
                    <div className="px-6 py-4 hover:bg-stone-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Expand button */}
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="mt-0.5 text-stone-300 hover:text-stone-500 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-stone-800 text-sm">{item.title}</span>
                            <CategoryBadge cat={item.category} />
                            {item.vendor && (
                              <span className="text-xs text-stone-400">{item.vendor}</span>
                            )}
                          </div>

                          {/* Cost row */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-stone-500 mt-1">
                            <span>
                              Estimado:{" "}
                              <strong className="text-stone-700">
                                {fmt(item.estimatedCost)}
                              </strong>
                            </span>
                            <span>
                              Real:{" "}
                              <strong
                                className={
                                  item.actualCost > item.estimatedCost && item.estimatedCost > 0
                                    ? "text-red-500"
                                    : "text-stone-700"
                                }
                              >
                                {fmt(item.actualCost)}
                              </strong>
                            </span>
                            <span>
                              Pago: <strong className="text-emerald-600">{fmt(item.paid)}</strong>
                            </span>
                            {item.actualCost > 0 && (
                              <span>
                                Saldo:{" "}
                                <strong
                                  className={balance > 0 ? "text-amber-600" : "text-stone-700"}
                                >
                                  {fmt(balance)}
                                </strong>
                              </span>
                            )}
                          </div>

                          {/* Mini progress */}
                          {(item.actualCost > 0 || item.estimatedCost > 0) && (
                            <div className="w-full max-w-xs bg-stone-100 rounded-full h-1.5 mt-2">
                              <div
                                className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${paidPct}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-100"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(item.id)}
                              className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="bg-stone-50 px-6 py-4 border-t border-stone-100">
                        {item.notes && (
                          <p className="text-sm text-stone-600 mb-3">
                            <span className="font-medium text-stone-500">Observações: </span>
                            {item.notes}
                          </p>
                        )}
                        {item.installments.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                              Parcelas
                            </p>
                            <div className="space-y-2">
                              {item.installments.map((inst) => (
                                <div
                                  key={inst.id}
                                  className="flex items-center gap-3 text-sm bg-white rounded-xl px-4 py-2.5 border border-stone-100"
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                      inst.paid ? "bg-emerald-400" : "bg-amber-400"
                                    }`}
                                  />
                                  <span className="text-stone-500 text-xs">
                                    {new Date(inst.dueDate).toLocaleDateString("pt-BR")}
                                  </span>
                                  <span className="font-medium text-stone-800">
                                    {fmt(inst.amount)}
                                  </span>
                                  <span
                                    className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                                      inst.paid
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {inst.paid ? "Pago" : "Pendente"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400">Sem parcelas cadastradas</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming installments */}
        {upcoming.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-50">
              <h2 className="font-semibold text-stone-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                Próximos vencimentos
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {upcoming.length}
                </span>
              </h2>
            </div>
            <div className="divide-y divide-stone-50">
              {upcoming.map((inst) => {
                const dueDate = new Date(inst.dueDate);
                const daysLeft = Math.ceil(
                  (dueDate.getTime() - now.getTime()) / 86400000
                );
                const isOverdue = daysLeft < 0;
                const isSoon = daysLeft <= 7;

                return (
                  <div key={inst.id} className="px-6 py-3 flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isOverdue
                          ? "bg-red-100 text-red-600"
                          : isSoon
                          ? "bg-amber-100 text-amber-600"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {isOverdue ? "!" : daysLeft}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{inst.itemTitle}</p>
                      <p className="text-xs text-stone-400">
                        <CategoryBadge cat={inst.itemCategory} />
                        <span className="ml-2">
                          {isOverdue
                            ? `Venceu há ${Math.abs(daysLeft)} dias`
                            : daysLeft === 0
                            ? "Vence hoje"
                            : `Vence em ${daysLeft} dias`}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-stone-800">{fmt(inst.amount)}</p>
                      <p className="text-xs text-stone-400">
                        {dueDate.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
