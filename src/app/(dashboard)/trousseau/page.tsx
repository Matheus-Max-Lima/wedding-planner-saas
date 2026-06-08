"use client";

import { useState, useEffect, useCallback } from "react";
import { Home, Plus, Trash2, X, CheckCircle2, Circle, Filter } from "lucide-react";

const CATEGORIES = [
  { key: "Cama", label: "Cama", emoji: "🛏️", color: "rose" },
  { key: "Banho", label: "Banho", emoji: "🚿", color: "blue" },
  { key: "Cozinha", label: "Cozinha", emoji: "🍳", color: "amber" },
  { key: "Sala", label: "Sala", emoji: "🛋️", color: "emerald" },
  { key: "Outros", label: "Outros", emoji: "📦", color: "purple" },
];

const COLOR_BADGE: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  purple: "bg-purple-100 text-purple-700",
};

const COLOR_PROGRESS: Record<string, string> = {
  rose: "bg-rose-400",
  blue: "bg-blue-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  purple: "bg-purple-400",
};

interface TrousseauItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  acquired: boolean;
  brand?: string;
  price?: number;
  notes?: string;
  priority: string;
}

type FilterType = "todos" | "adquiridos" | "pendentes";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function TrousseauPage() {
  const [items, setItems] = useState<TrousseauItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("todos");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Cama",
    quantity: "1",
    brand: "",
    price: "",
    priority: "medium",
  });
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/trousseau");
      if (res.ok) setItems(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleAcquired = async (item: TrousseauItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, acquired: !i.acquired } : i))
    );
    await fetch(`/api/trousseau/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acquired: !item.acquired }),
    });
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/trousseau/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/trousseau", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: parseInt(form.quantity) || 1,
        price: form.price ? parseFloat(form.price) : undefined,
      }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setForm({ name: "", category: "Cama", quantity: "1", brand: "", price: "", priority: "medium" });
      setShowForm(false);
    }
    setSaving(false);
  };

  const getFilteredItems = (categoryKey: string) => {
    return items
      .filter((i) => i.category === categoryKey)
      .filter((i) => {
        if (filter === "adquiridos") return i.acquired;
        if (filter === "pendentes") return !i.acquired;
        return true;
      });
  };

  const totalValue = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const acquiredValue = items
    .filter((i) => i.acquired)
    .reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const totalItems = items.length;
  const acquiredItems = items.filter((i) => i.acquired).length;

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Home className="w-6 h-6 text-rose-500" /> Enxoval
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Organize tudo para o seu novo lar
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
          >
            <Plus className="w-4 h-4" /> Adicionar item
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-stone-800">{totalItems}</p>
            <p className="text-xs text-stone-400 mt-0.5">Total de itens</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{acquiredItems}</p>
            <p className="text-xs text-stone-400 mt-0.5">Adquiridos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-lg font-bold text-rose-600">{formatCurrency(acquiredValue)}</p>
            <p className="text-xs text-stone-400 mt-0.5">Valor adquirido</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-lg font-bold text-stone-800">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-stone-400 mt-0.5">Valor total</p>
          </div>
        </div>

        {/* Overall progress */}
        {totalItems > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-stone-700">Progresso geral</span>
              <span className="text-stone-500">{acquiredItems}/{totalItems} ({Math.round((acquiredItems / totalItems) * 100)}%)</span>
            </div>
            <div className="bg-stone-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-rose-400 to-rose-500 h-3 rounded-full transition-all"
                style={{ width: `${(acquiredItems / totalItems) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {(["todos", "adquiridos", "pendentes"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-rose-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === null ? "bg-stone-800 text-white" : "bg-white text-stone-500 border border-stone-200"
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat.key ? "bg-stone-800 text-white" : "bg-white text-stone-500 border border-stone-200"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.filter((cat) => activeCategory === null || cat.key === activeCategory).map((cat) => {
              const catItems = getFilteredItems(cat.key);
              const catTotal = items.filter((i) => i.category === cat.key).length;
              const catAcquired = items.filter((i) => i.category === cat.key && i.acquired).length;
              const catPercent = catTotal > 0 ? Math.round((catAcquired / catTotal) * 100) : 0;

              return (
                <div key={cat.key} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-stone-800">{cat.label}</h3>
                        <p className="text-xs text-stone-400">
                          {catAcquired} de {catTotal} adquiridos · {catPercent}%
                        </p>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-stone-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${COLOR_PROGRESS[cat.color]}`}
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  {catItems.length === 0 ? (
                    <div className="px-5 py-6 text-center text-stone-400 text-sm">
                      {filter !== "todos" ? `Nenhum item ${filter} nesta categoria` : "Nenhum item nesta categoria ainda"}
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-50">
                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-stone-50 group transition-colors"
                        >
                          <button onClick={() => toggleAcquired(item)} className="flex-shrink-0">
                            {item.acquired ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-stone-300" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${item.acquired ? "line-through text-stone-400" : "text-stone-800"}`}>
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {item.brand && (
                                <span className="text-xs text-stone-400">{item.brand}</span>
                              )}
                              <span className="text-xs text-stone-300">Qtd: {item.quantity}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                item.priority === "high" ? "bg-red-100 text-red-600" :
                                item.priority === "medium" ? "bg-amber-100 text-amber-600" :
                                "bg-stone-100 text-stone-500"
                              }`}>
                                {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Média" : "Baixa"}
                              </span>
                            </div>
                          </div>
                          {item.price && item.price > 0 && (
                            <span className="text-sm font-semibold text-stone-700 flex-shrink-0">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          )}
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 text-stone-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Novo Item do Enxoval</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome do item *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Jogo de cama queen casal"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Marca</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Ex: Karsten, Porto Seguro..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Prioridade</label>
                <div className="flex gap-2">
                  {[
                    { value: "high", label: "Alta", color: "red" },
                    { value: "medium", label: "Média", color: "amber" },
                    { value: "low", label: "Baixa", color: "stone" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        form.priority === p.value
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-stone-200 text-stone-500"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-50">
                  {saving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
