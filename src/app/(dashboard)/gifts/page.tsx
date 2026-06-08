"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gift, Plus, Trash2, Edit2, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface GiftItem {
  id: string;
  name: string;
  category: string;
  store: string | null;
  url: string | null;
  price: number;
  quantity: number;
  quantityReceived: number;
  notes: string | null;
}

const CATEGORIES = ["Casa", "Cozinha", "Quarto", "Banheiro", "Decoração", "Eletrônicos", "Lazer", "Outros"];
const emptyForm = { name: "", category: "Casa", store: "", url: "", price: "", quantity: "1", quantityReceived: "0", notes: "" };

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGift, setEditGift] = useState<GiftItem | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("Todos");

  async function load() {
    const data = await fetch("/api/gifts").then(r => r.json());
    setGifts(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      if (editGift) {
        await fetch(`/api/gifts/${editGift.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Item atualizado!");
      } else {
        await fetch("/api/gifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Item adicionado!");
      }
      await load();
      closeModal();
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function deleteGift(id: string) {
    await fetch(`/api/gifts/${id}`, { method: "DELETE" });
    toast.success("Item removido");
    await load();
  }

  function openEdit(g: GiftItem) {
    setEditGift(g);
    setForm({ name: g.name, category: g.category, store: g.store || "", url: g.url || "", price: String(g.price), quantity: String(g.quantity), quantityReceived: String(g.quantityReceived), notes: g.notes || "" });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditGift(null);
    setForm(emptyForm);
  }

  const filtered = gifts.filter(g => filterCat === "Todos" || g.category === filterCat);
  const received = gifts.filter(g => g.quantityReceived >= g.quantity).length;
  const totalValue = gifts.reduce((s, g) => s + g.price * g.quantity, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><Gift className="w-6 h-6 text-rose-500" /> Lista de Presentes</h1>
          <p className="text-stone-500 text-sm mt-1">{gifts.length} itens · {received} recebidos · {formatCurrency(totalValue)} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {["Todos", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"}`}>{cat}</button>
        ))}
      </div>

      {/* Gift grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <Gift className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">Nenhum presente nesta categoria</p>
          </div>
        ) : filtered.map(g => {
          const pct = g.quantity > 0 ? Math.min(100, (g.quantityReceived / g.quantity) * 100) : 0;
          const received = g.quantityReceived >= g.quantity;
          return (
            <div key={g.id} className={`bg-white rounded-2xl border ${received ? "border-emerald-200 bg-emerald-50/30" : "border-stone-100"} p-4 hover:shadow-sm transition-all group`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800 text-sm">{g.name}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{g.category}{g.store ? ` · ${g.store}` : ""}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  {g.url && <a href={g.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><ExternalLink className="w-3.5 h-3.5" /></a>}
                  <button onClick={() => openEdit(g)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteGift(g.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-base font-bold text-stone-800 mb-2">{formatCurrency(g.price)}</p>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mb-1">
                <div className={`h-1.5 rounded-full ${received ? "bg-emerald-500" : "bg-rose-400"}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-stone-400">{g.quantityReceived} de {g.quantity} recebidos</p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editGift ? "Editar item" : "Novo item"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Loja</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.store} onChange={e => setForm((p: any) => ({ ...p, store: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Link</label>
                <input type="url" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.url} onChange={e => setForm((p: any) => ({ ...p, url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Preço</label>
                  <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.price} onChange={e => setForm((p: any) => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Qtd desejada</label>
                  <input type="number" min="1" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.quantity} onChange={e => setForm((p: any) => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Recebidos</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.quantityReceived} onChange={e => setForm((p: any) => ({ ...p, quantityReceived: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : editGift ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
