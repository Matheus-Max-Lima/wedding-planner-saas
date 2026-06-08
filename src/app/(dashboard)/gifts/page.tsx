"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit3, Gift, Share2, ExternalLink, Check, Package } from "lucide-react";

type GiftItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  storeUrl?: string;
  storeName?: string;
  reserved: boolean;
  reservedBy?: string;
  received: boolean;
  priority: string;
  quantity: number;
};

const CATEGORIES = ["Todos", "Casa", "Cozinha", "Quarto", "Banheiro", "Eletrodomésticos", "Viagem", "Outros"];

const PRIORITIES = [
  { value: "alta", label: "Alta", style: "bg-red-50 text-red-600 border-red-200" },
  { value: "media", label: "Média", style: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "baixa", label: "Baixa", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.value, p]));

const CATEGORY_EMOJIS: Record<string, string> = {
  Casa: "🏠",
  Cozinha: "🍳",
  Quarto: "🛏️",
  Banheiro: "🛁",
  Eletrodomésticos: "🔌",
  Viagem: "✈️",
  Outros: "🎁",
};

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "received", label: "Recebido" },
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Casa",
  storeUrl: "",
  storeName: "",
  priority: "media",
  quantity: "1",
  notes: "",
};

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGifts();
  }, []);

  async function fetchGifts() {
    setLoading(true);
    const res = await fetch("/api/gifts");
    if (res.ok) setGifts(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      quantity: parseInt(form.quantity) || 1,
    };
    if (editingId) {
      const res = await fetch(`/api/gifts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setGifts((g) => g.map((x) => (x.id === editingId ? updated : x)));
      }
    } else {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setGifts((g) => [...g, created]);
      }
    }
    setSaving(false);
    cancelForm();
  }

  async function deleteGift(id: string) {
    if (!confirm("Remover este presente?")) return;
    await fetch(`/api/gifts/${id}`, { method: "DELETE" });
    setGifts((g) => g.filter((x) => x.id !== id));
  }

  async function markReceived(id: string) {
    const res = await fetch(`/api/gifts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ received: true, reserved: true }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGifts((g) => g.map((x) => (x.id === id ? updated : x)));
    }
  }

  async function toggleReserved(id: string, current: boolean) {
    const res = await fetch(`/api/gifts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserved: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGifts((g) => g.map((x) => (x.id === id ? updated : x)));
    }
  }

  function startEdit(gift: GiftItem) {
    setForm({
      name: gift.name,
      description: gift.description || "",
      price: gift.price?.toString() || "",
      category: gift.category || "Casa",
      storeUrl: gift.storeUrl || "",
      storeName: gift.storeName || "",
      priority: gift.priority,
      quantity: gift.quantity?.toString() || "1",
      notes: "",
    });
    setEditingId(gift.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function shareRegistry() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const filtered = gifts.filter((g) => {
    const matchCat = categoryFilter === "Todos" || g.category === categoryFilter;
    const matchPriority = priorityFilter === "all" || g.priority === priorityFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && !g.reserved && !g.received) ||
      (statusFilter === "reserved" && g.reserved && !g.received) ||
      (statusFilter === "received" && g.received);
    return matchCat && matchPriority && matchStatus;
  });

  const totalGifts = gifts.length;
  const reserved = gifts.filter((g) => g.reserved && !g.received).length;
  const received = gifts.filter((g) => g.received).length;
  const totalValue = gifts.reduce((sum, g) => sum + (g.price || 0) * (g.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Header */}
      <div className="bg-white border-b border-rose-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Lista de Presentes</h1>
            <p className="text-stone-500 text-sm mt-0.5">Gerencie a lista de presentes do casamento</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={shareRegistry}
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Link copiado!" : "Compartilhar"}
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e] text-white rounded-xl font-medium text-sm hover:bg-rose-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Presente
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total de presentes", value: totalGifts, icon: "🎁", color: "text-stone-700" },
            { label: "Reservados", value: reserved, icon: "🔒", color: "text-blue-600" },
            { label: "Recebidos", value: received, icon: "✅", color: "text-emerald-600" },
            {
              label: "Valor total",
              value: totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              icon: "💰",
              color: "text-[#d4af37]",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status filter */}
            <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s.value ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
              <button
                onClick={() => setPriorityFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  priorityFilter === "all" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Prioridade
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriorityFilter(p.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    priorityFilter === p.value ? `${p.style}` : "text-stone-500 hover:text-stone-700 border-transparent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? "bg-[#f43f5e] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                {cat !== "Todos" && CATEGORY_EMOJIS[cat] ? `${CATEGORY_EMOJIS[cat]} ` : ""}{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <h3 className="font-semibold text-stone-800">
                {editingId ? "Editar Presente" : "Novo Presente"}
              </h3>
              <button onClick={cancelForm} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-stone-600">Nome do presente *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Jogo de panelas"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  {CATEGORIES.filter((c) => c !== "Todos").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Preço (R$)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Quantidade</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  min="1"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Prioridade</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Loja</label>
                <input
                  value={form.storeName}
                  onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  placeholder="Nome da loja"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-stone-600">Link da loja</label>
                <input
                  value={form.storeUrl}
                  onChange={(e) => setForm((f) => ({ ...f, storeUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-medium text-stone-600">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detalhes do presente..."
                  rows={2}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#f43f5e] text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gifts Grid */}
        {loading ? (
          <div className="text-center py-16 text-stone-400">Carregando presentes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-stone-500 font-medium">Nenhum presente encontrado</p>
            <p className="text-stone-400 text-sm mt-1">Adicione presentes à sua lista</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((gift) => {
              const priorityMeta = PRIORITY_MAP[gift.priority] || PRIORITY_MAP["media"];
              const emoji = CATEGORY_EMOJIS[gift.category || ""] || "🎁";
              return (
                <div
                  key={gift.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                    gift.received
                      ? "border-emerald-100 bg-emerald-50/30"
                      : gift.reserved
                      ? "border-blue-100"
                      : "border-stone-100 hover:border-rose-100"
                  }`}
                >
                  {/* Image placeholder */}
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-rose-50 to-pink-50 rounded-t-2xl flex items-center justify-center">
                      <span className="text-5xl">{emoji}</span>
                    </div>
                    {/* Status overlay badge */}
                    <div className="absolute top-3 left-3">
                      {gift.received ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500 text-white font-medium shadow-sm">
                          ✅ Recebido
                        </span>
                      ) : gift.reserved ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500 text-white font-medium shadow-sm">
                          🔒 Reservado
                        </span>
                      ) : null}
                    </div>
                    {/* Priority */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityMeta.style}`}>
                        {priorityMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-800 leading-tight truncate">{gift.name}</h3>
                        {gift.category && (
                          <p className="text-xs text-stone-500 mt-0.5">{gift.category}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(gift)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGift(gift.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {gift.description && (
                      <p className="text-xs text-stone-500 mb-2 line-clamp-2">{gift.description}</p>
                    )}

                    {/* Price & Qty */}
                    <div className="flex items-center justify-between mb-3">
                      {gift.price != null ? (
                        <span className="font-semibold text-[#f43f5e]">
                          {gift.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-sm">Preço não definido</span>
                      )}
                      {gift.quantity > 1 && (
                        <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          x{gift.quantity}
                        </span>
                      )}
                    </div>

                    {/* Store */}
                    {(gift.storeName || gift.storeUrl) && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Package className="w-3.5 h-3.5 text-stone-400" />
                        {gift.storeUrl ? (
                          <a
                            href={gift.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 truncate"
                          >
                            {gift.storeName || "Ver na loja"}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-stone-500">{gift.storeName}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-stone-50">
                      {!gift.received && (
                        <>
                          <button
                            onClick={() => toggleReserved(gift.id, gift.reserved)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                              gift.reserved
                                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {gift.reserved ? "Remover reserva" : "Marcar reservado"}
                          </button>
                          <button
                            onClick={() => markReceived(gift.id)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Recebido
                          </button>
                        </>
                      )}
                      {gift.received && (
                        <div className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 text-center">
                          ✅ Presente recebido
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
