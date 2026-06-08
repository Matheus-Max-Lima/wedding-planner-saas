"use client";

import { useState, useEffect } from "react";
import {
  Plus, Star, Phone, Mail, Globe, FileText, X, ChevronDown, ChevronUp,
  GitCompare, Trash2, Edit3, Check, Filter, Search, Upload
} from "lucide-react";

type Vendor = {
  id: string;
  category: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  price?: number;
  status: string;
  rating?: number;
  notes?: string;
  contractUrl?: string;
};

const CATEGORIES = [
  "Todos",
  "Buffet",
  "Fotografia",
  "Filmagem",
  "Decoração",
  "Música/DJ",
  "Local",
  "Vestido/Traje",
  "Cerimonialista",
  "Floricultura",
  "Convites",
  "Bolo",
  "Outros",
];

const STATUSES = ["Todos", "prospect", "contacted", "hired", "rejected"];

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospecto",
  contacted: "Contactado",
  hired: "Contratado",
  rejected: "Rejeitado",
};

const STATUS_STYLES: Record<string, string> = {
  prospect: "bg-stone-100 text-stone-600 border border-stone-200",
  contacted: "bg-blue-50 text-blue-700 border border-blue-200",
  hired: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Buffet: "🍽️",
  Fotografia: "📸",
  Filmagem: "🎥",
  Decoração: "🌸",
  "Música/DJ": "🎵",
  Local: "🏛️",
  "Vestido/Traje": "👗",
  Cerimonialista: "💍",
  Floricultura: "💐",
  Convites: "✉️",
  Bolo: "🎂",
  Outros: "📦",
};

const emptyForm = {
  name: "",
  category: "Buffet",
  contact: "",
  email: "",
  phone: "",
  website: "",
  price: "",
  status: "prospect",
  rating: "",
  notes: "",
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`w-4 h-4 ${
              s <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-stone-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    setLoading(true);
    const res = await fetch("/api/vendors");
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      rating: form.rating ? parseInt(form.rating) : null,
    };
    if (editingId) {
      const res = await fetch(`/api/vendors/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setVendors((v) => v.map((x) => (x.id === editingId ? updated : x)));
      }
    } else {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setVendors((v) => [...v, created]);
      }
    }
    setSaving(false);
    cancelForm();
  }

  async function deleteVendor(id: string) {
    if (!confirm("Remover este fornecedor?")) return;
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    setVendors((v) => v.filter((x) => x.id !== id));
    setCompareIds((ids) => ids.filter((x) => x !== id));
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setVendors((v) => v.map((x) => (x.id === id ? updated : x)));
    }
  }

  function startEdit(vendor: Vendor) {
    setForm({
      name: vendor.name,
      category: vendor.category,
      contact: vendor.contact || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      website: vendor.website || "",
      price: vendor.price?.toString() || "",
      status: vendor.status,
      rating: vendor.rating?.toString() || "",
      notes: vendor.notes || "",
    });
    setEditingId(vendor.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // máximo 3
      return [...prev, id];
    });
  }

  const filtered = vendors.filter((v) => {
    const matchCat = categoryFilter === "Todos" || v.category === categoryFilter;
    const matchStatus = statusFilter === "Todos" || v.status === statusFilter;
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const totalVendors = vendors.length;
  const hired = vendors.filter((v) => v.status === "hired").length;
  const prospects = vendors.filter((v) => v.status === "prospect" || v.status === "contacted").length;
  const budgetAllocated = vendors
    .filter((v) => v.status === "hired" && v.price)
    .reduce((sum, v) => sum + (v.price || 0), 0);

  const compareVendors = vendors.filter((v) => compareIds.includes(v.id));

  // Encontrar melhor preço e maior avaliação entre os selecionados para comparação
  const comparePrices = compareVendors.map((v) => v.price).filter((p): p is number => p != null);
  const compareRatings = compareVendors.map((v) => v.rating).filter((r): r is number => r != null);
  const bestPrice = comparePrices.length > 0 ? Math.min(...comparePrices) : null;
  const bestRating = compareRatings.length > 0 ? Math.max(...compareRatings) : null;

  const compareRows: Array<{ label: string; key: keyof Vendor | "actions" }> = [
    { label: "Nome", key: "name" },
    { label: "Categoria", key: "category" },
    { label: "Status", key: "status" },
    { label: "Preço", key: "price" },
    { label: "Avaliação", key: "rating" },
    { label: "Contato", key: "contact" },
    { label: "Website", key: "website" },
    { label: "Notas", key: "notes" },
  ];

  function renderCompareCell(vendor: Vendor, key: keyof Vendor | "actions") {
    if (key === "status") {
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[vendor.status]}`}>
          {STATUS_LABELS[vendor.status]}
        </span>
      );
    }
    if (key === "price") {
      const isBest = vendor.price != null && vendor.price === bestPrice && comparePrices.length > 1;
      return (
        <span
          className={`text-sm font-medium ${isBest ? "text-emerald-600" : "text-stone-700"}`}
          style={isBest ? { backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: 8 } : {}}
        >
          {vendor.price != null
            ? vendor.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "—"}
          {isBest && <span className="ml-1 text-xs">✓ melhor</span>}
        </span>
      );
    }
    if (key === "rating") {
      if (!vendor.rating) return <span className="text-stone-400 text-sm">—</span>;
      const isBest = vendor.rating === bestRating && compareRatings.length > 1;
      return (
        <div
          className="inline-flex items-center gap-1 rounded-lg px-1"
          style={isBest ? { backgroundColor: "#fef9c3", border: "1px solid #d4af37" } : {}}
        >
          <StarRating value={vendor.rating} />
          {isBest && <span className="text-xs ml-1" style={{ color: "#d4af37" }}>★</span>}
        </div>
      );
    }
    if (key === "website") {
      return vendor.website ? (
        <a
          href={vendor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-xs truncate block max-w-[120px]"
        >
          {vendor.website.replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <span className="text-stone-400 text-sm">—</span>
      );
    }
    if (key === "notes") {
      return vendor.notes ? (
        <span className="text-xs text-stone-600 line-clamp-2 max-w-[140px]">{vendor.notes}</span>
      ) : (
        <span className="text-stone-400 text-sm">—</span>
      );
    }
    const val = vendor[key as keyof Vendor];
    return (
      <span className="text-sm text-stone-700">
        {val != null && val !== "" ? String(val) : "—"}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Header */}
      <div className="bg-white border-b border-rose-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Fornecedores</h1>
            <p className="text-stone-500 text-sm mt-0.5">Gerencie todos os seus fornecedores</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e] text-white rounded-xl font-medium text-sm hover:bg-rose-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Fornecedor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: totalVendors, icon: "🏪", color: "text-stone-700" },
            { label: "Contratados", value: hired, icon: "✅", color: "text-emerald-600" },
            { label: "Em análise", value: prospects, icon: "🔍", color: "text-blue-600" },
            {
              label: "Orçamento alocado",
              value: budgetAllocated.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fornecedor..."
                className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "Todos" ? "Todos os status" : STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
                {editingId ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h3>
              <button onClick={cancelForm} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Nome *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome do fornecedor"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Categoria *</label>
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
                <label className="text-xs font-medium text-stone-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  {STATUSES.filter((s) => s !== "Todos").map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Contato</label>
                <input
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="Nome do contato"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Telefone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
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
                <label className="text-xs font-medium text-stone-600">Avaliação</label>
                <div className="flex items-center gap-2 py-2">
                  <StarRating
                    value={parseInt(form.rating) || 0}
                    onChange={(v) => setForm((f) => ({ ...f, rating: v.toString() }))}
                  />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-medium text-stone-600">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Anotações sobre o fornecedor..."
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

        {/* Vendor Grid */}
        {loading ? (
          <div className="text-center py-16 text-stone-400">Carregando fornecedores...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-stone-500 font-medium">Nenhum fornecedor encontrado</p>
            <p className="text-stone-400 text-sm mt-1">Adicione seus primeiros fornecedores</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((vendor) => {
              const isSelected = compareIds.includes(vendor.id);
              const canAdd = compareIds.length < 3;
              return (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all ${
                    isSelected
                      ? "border-[#d4af37] shadow-md ring-2 ring-[#d4af37]/30"
                      : "border-stone-100 hover:shadow-md hover:border-rose-100"
                  }`}
                >
                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl flex-shrink-0">
                          {CATEGORY_EMOJIS[vendor.category] || "📦"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-stone-800 leading-tight">{vendor.name}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">{vendor.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(vendor)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteVendor(vendor.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[vendor.status]}`}>
                        {STATUS_LABELS[vendor.status] || vendor.status}
                      </span>
                      {vendor.rating ? (
                        <StarRating value={vendor.rating} />
                      ) : null}
                    </div>

                    {/* Contact info */}
                    <div className="space-y-1.5 mb-3">
                      {vendor.contact && (
                        <p className="text-xs text-stone-600 flex items-center gap-1.5">
                          <span className="w-4 h-4 inline-flex items-center justify-center">👤</span>
                          {vendor.contact}
                        </p>
                      )}
                      {vendor.phone && (
                        <a href={`tel:${vendor.phone}`} className="text-xs text-stone-600 flex items-center gap-1.5 hover:text-rose-600">
                          <Phone className="w-3.5 h-3.5" />
                          {vendor.phone}
                        </a>
                      )}
                      {vendor.email && (
                        <a href={`mailto:${vendor.email}`} className="text-xs text-stone-600 flex items-center gap-1.5 hover:text-rose-600 truncate">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{vendor.email}</span>
                        </a>
                      )}
                      {vendor.website && (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 flex items-center gap-1.5 hover:text-blue-700 truncate"
                        >
                          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{vendor.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      )}
                    </div>

                    {/* Price */}
                    {vendor.price != null && (
                      <div className="bg-rose-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-stone-500">Valor</p>
                        <p className="font-semibold text-[#f43f5e]">
                          {vendor.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {vendor.notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 rounded-xl px-3 py-2 mb-3 line-clamp-2">
                        {vendor.notes}
                      </p>
                    )}

                    {/* Contract & quick status & compare checkbox */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                      <div className="flex items-center gap-1.5">
                        <FileText className={`w-3.5 h-3.5 ${vendor.contractUrl ? "text-emerald-500" : "text-stone-300"}`} />
                        <span className="text-xs text-stone-400">
                          {vendor.contractUrl ? "Contrato anexado" : "Sem contrato"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {vendor.status !== "hired" && (
                          <button
                            onClick={() => updateStatus(vendor.id, "hired")}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Contratar
                          </button>
                        )}
                        {/* Checkbox Comparar */}
                        <label
                          className={`flex items-center gap-1.5 cursor-pointer select-none ${
                            !isSelected && !canAdd ? "opacity-40 cursor-not-allowed" : ""
                          }`}
                          title={!isSelected && !canAdd ? "Máximo de 3 fornecedores para comparar" : ""}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!isSelected && !canAdd}
                            onChange={() => toggleCompare(vendor.id)}
                            className="w-3.5 h-3.5 accent-[#d4af37] rounded"
                          />
                          <span className="text-xs text-stone-500 font-medium">Comparar</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating comparison bar */}
      {compareIds.length >= 2 && !showCompare && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3 rounded-2xl shadow-2xl"
          style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", border: "1px solid #d4af37" }}
        >
          <span className="text-white text-sm font-medium">
            Comparando {compareIds.length} fornecedor{compareIds.length > 1 ? "es" : ""}
          </span>
          <button
            onClick={() => setShowCompare(true)}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: "#d4af37", color: "#fff" }}
          >
            Ver comparação
          </button>
          <button
            onClick={() => setCompareIds([])}
            className="text-stone-400 hover:text-white transition-colors"
            title="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && compareVendors.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-[#d4af37]" />
                Comparar Fornecedores
              </h2>
              <button onClick={() => setShowCompare(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-500 w-32 bg-stone-50 rounded-tl-xl">
                      Campo
                    </th>
                    {compareVendors.map((v) => (
                      <th key={v.id} className="py-3 px-4 bg-rose-50 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                          {CATEGORY_EMOJIS[v.category] || "📦"}
                        </div>
                        <p className="font-semibold text-stone-800 text-sm leading-tight">{v.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{v.category}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, rowIdx) => (
                    <tr
                      key={row.key}
                      className={rowIdx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-stone-500 border-r border-stone-100">
                        {row.label}
                      </td>
                      {compareVendors.map((v) => (
                        <td key={v.id} className="py-3 px-4 text-center">
                          {renderCompareCell(v, row.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="px-6 pb-3 flex gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "#dcfce7" }} />
                Melhor preço
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "#fef9c3", border: "1px solid #d4af37" }} />
                Maior avaliação
              </span>
            </div>
            <div className="px-6 pb-6 flex flex-wrap justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                onClick={() => setShowCompare(false)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                Fechar
              </button>
              {compareVendors.map((v) =>
                v.status !== "hired" ? (
                  <button
                    key={v.id}
                    onClick={() => {
                      updateStatus(v.id, "hired");
                      setShowCompare(false);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Contratar {v.name}
                  </button>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
