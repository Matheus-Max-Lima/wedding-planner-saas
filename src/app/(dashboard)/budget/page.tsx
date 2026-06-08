"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, Plus, Trash2, Edit2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
  vendor: string | null;
  notes: string | null;
}

interface BudgetData {
  items: BudgetItem[];
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
}

const CATEGORIES = ["Local", "Buffet", "Fotografia", "Filmagem", "Musica", "Decoracao", "Vestido", "Convidados", "Papelaria", "Lua de mel", "Outros"];

const emptyForm = { category: "Outros", description: "", estimatedCost: "", actualCost: "", paid: false, vendor: "", notes: "" };

export default function BudgetPage() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/budget").then(r => r.json());
    setData(res);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.description.trim()) return toast.error("Descricao obrigatoria");
    setSaving(true);
    try {
      if (editItem) {
        const res = await fetch(`/api/budget/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Item atualizado!");
      } else {
        const res = await fetch("/api/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Item adicionado!");
      }
      await load();
      closeModal();
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    toast.success("Item removido");
    await load();
  }

  async function togglePaid(item: BudgetItem) {
    await fetch(`/api/budget/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !item.paid }),
    });
    await load();
  }

  function openEdit(item: BudgetItem) {
    setEditItem(item);
    setForm({
      category: item.category,
      description: item.description,
      estimatedCost: String(item.estimatedCost),
      actualCost: String(item.actualCost),
      paid: item.paid,
      vendor: item.vendor || "",
      notes: item.notes || "",
    });
    setShowAdd(true);
  }

  function closeModal() {
    setShowAdd(false);
    setEditItem(null);
    setForm(emptyForm);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" />
    </div>
  );
  if (!data) return null;

  const usedPct = data.totalBudget > 0 ? Math.min(100, (data.totalActual / data.totalBudget) * 100) : 0;
  const remaining = data.totalBudget - data.totalActual;

  const byCat = CATEGORIES.reduce((acc, cat) => {
    const catItems = data.items.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, BudgetItem[]>);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-rose-500" /> Orcamento
          </h1>
          <p className="text-stone-500 text-sm mt-1">Gerencie os gastos do seu casamento</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo item
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Orcamento total", value: formatCurrency(data.totalBudget), color: "text-stone-700" },
          { label: "Total estimado", value: formatCurrency(data.totalEstimated), color: "text-blue-600" },
          { label: "Total real", value: formatCurrency(data.totalActual), color: "text-amber-600" },
          { label: "Pago", value: formatCurrency(data.totalPaid), color: "text-emerald-600" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-stone-100 p-4">
            <p className="text-xs text-stone-500">{card.label}</p>
            <p className={`text-lg font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-stone-700">Uso do orcamento</span>
          </div>
          <span className={`text-sm font-bold ${usedPct > 90 ? "text-red-500" : "text-emerald-600"}`}>{usedPct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${usedPct > 100 ? "bg-red-500" : usedPct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(100, usedPct)}%` }}
          />
        </div>
        <p className="text-xs text-stone-500 mt-2">
          {remaining >= 0 ? `Restam ${formatCurrency(remaining)}` : `Acima do orcamento em ${formatCurrency(-remaining)}`}
        </p>
      </div>

      {/* Items by category */}
      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-600">{cat}</h3>
            <span className="text-xs text-stone-400">{formatCurrency(items.reduce((s, i) => s + i.actualCost, 0))}</span>
          </div>
          <div className="divide-y divide-stone-50">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50">
                <button
                  onClick={() => togglePaid(item)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    item.paid ? "bg-emerald-500 border-emerald-500" : "border-stone-300 hover:border-emerald-400"
                  }`}
                >
                  {item.paid && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700">{item.description}</p>
                  {item.vendor && <p className="text-xs text-stone-400">{item.vendor}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-700">{formatCurrency(item.actualCost)}</p>
                  {item.estimatedCost !== item.actualCost && (
                    <p className="text-xs text-stone-400">Est: {formatCurrency(item.estimatedCost)}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {data.items.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <DollarSign className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Nenhum item de orcamento ainda.</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm hover:bg-rose-600">
            Adicionar primeiro item
          </button>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editItem ? "Editar item" : "Novo item"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                <select
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descricao *</label>
                <input
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Valor estimado</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={form.estimatedCost}
                    onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Valor real</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={form.actualCost}
                    onChange={e => setForm(p => ({ ...p, actualCost: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fornecedor</label>
                <input
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.vendor}
                  onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.paid} onChange={e => setForm(p => ({ ...p, paid: e.target.checked }))} className="rounded" />
                <span className="text-sm text-stone-700">Pago</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60"
              >
                {saving ? "Salvando..." : editItem ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
