"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Plus, Search, Trash2, Edit2, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  price: number;
  paid: boolean;
  contractSigned: boolean;
  rating: number | null;
  notes: string | null;
  status: string;
}

const CATEGORIES = ["Local", "Buffet", "Fotografia", "Filmagem", "Música/DJ", "Decoração", "Cerimonialista", "Papelaria", "Bem-casados", "Transporte", "Outros"];
const STATUSES = ["PROSPECT", "NEGOTIATING", "CONTRACTED", "COMPLETED", "CANCELLED"];
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PROSPECT: { label: "Prospecto", color: "bg-stone-100 text-stone-600" },
  NEGOTIATING: { label: "Negociando", color: "bg-blue-100 text-blue-600" },
  CONTRACTED: { label: "Contratado", color: "bg-emerald-100 text-emerald-700" },
  COMPLETED: { label: "Concluído", color: "bg-purple-100 text-purple-700" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-600" },
};

const emptyForm = { name: "", category: "Outros", contactName: "", email: "", phone: "", website: "", price: "", paid: false, contractSigned: false, rating: "", notes: "", status: "PROSPECT" };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/vendors").then(r => r.json());
    setVendors(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      if (editVendor) {
        await fetch(`/api/vendors/${editVendor.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Fornecedor atualizado!");
      } else {
        await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Fornecedor adicionado!");
      }
      await load();
      closeModal();
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function deleteVendor(id: string) {
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    toast.success("Fornecedor removido");
    await load();
  }

  function openEdit(v: Vendor) {
    setEditVendor(v);
    setForm({ name: v.name, category: v.category, contactName: v.contactName || "", email: v.email || "", phone: v.phone || "", website: v.website || "", price: String(v.price), paid: v.paid, contractSigned: v.contractSigned, rating: v.rating ? String(v.rating) : "", notes: v.notes || "", status: v.status });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditVendor(null);
    setForm(emptyForm);
  }

  const filtered = vendors.filter(v =>
    (filterCat === "Todos" || v.category === filterCat) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const contracted = vendors.filter(v => v.contractSigned).length;
  const totalSpent = vendors.filter(v => v.paid).reduce((s, v) => s + v.price, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-rose-500" /> Fornecedores
          </h1>
          <p className="text-stone-500 text-sm mt-1">{vendors.length} fornecedores · {contracted} contratados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
          <p className="text-2xl font-bold text-stone-800">{vendors.length}</p>
          <p className="text-xs text-stone-500 mt-1">Total de fornecedores</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{contracted}</p>
          <p className="text-xs text-stone-500 mt-1">Com contrato</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-stone-500 mt-1">Total pago</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="Buscar fornecedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Todos", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterCat === cat ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <Star className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">Nenhum fornecedor encontrado</p>
          </div>
        ) : filtered.map(vendor => {
          const status = STATUS_LABELS[vendor.status] || STATUS_LABELS.PROSPECT;
          return (
            <div key={vendor.id} className="bg-white rounded-2xl border border-stone-100 p-5 hover:border-rose-200 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-stone-800">{vendor.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{vendor.category}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${status.color}`}>{status.label}</span>
              </div>
              {vendor.contactName && <p className="text-sm text-stone-600 mb-2">{vendor.contactName}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
                {vendor.phone && <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-rose-500"><Phone className="w-3 h-3" />{vendor.phone}</a>}
                {vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-rose-500"><Mail className="w-3 h-3" />{vendor.email}</a>}
                {vendor.website && <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-rose-500"><Globe className="w-3 h-3" />Site</a>}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-stone-800">{formatCurrency(vendor.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {vendor.contractSigned && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />Contrato</span>}
                    {vendor.paid && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />Pago</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => openEdit(vendor)} className="p-2 text-stone-400 hover:text-blue-500 rounded-xl hover:bg-blue-50">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteVendor(vendor.id)} className="p-2 text-stone-400 hover:text-red-500 rounded-xl hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {vendor.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < (vendor.rating || 0) ? "text-amber-400 text-sm" : "text-stone-200 text-sm"}>★</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editVendor ? "Editar fornecedor" : "Novo fornecedor"}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Contato</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.contactName} onChange={e => setForm((p: any) => ({ ...p, contactName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.phone} onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Website</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.website} onChange={e => setForm((p: any) => ({ ...p, website: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Valor (R$)</label>
                  <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.price} onChange={e => setForm((p: any) => ({ ...p, price: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Avaliação (1-5)</label>
                <input type="number" min="1" max="5" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.rating} onChange={e => setForm((p: any) => ({ ...p, rating: e.target.value }))} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.contractSigned} onChange={e => setForm((p: any) => ({ ...p, contractSigned: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-stone-700">Contrato assinado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.paid} onChange={e => setForm((p: any) => ({ ...p, paid: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-stone-700">Pago</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" value={form.notes} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">
                {saving ? "Salvando..." : editVendor ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
