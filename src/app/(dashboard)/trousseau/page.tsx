"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Plus, Trash2, Edit2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TrousseauItem { id: string; name: string; category: string; quantity: number; quantityOwned: number; estimatedPrice: number; store: string | null; priority: string; purchased: boolean; }

const CATEGORIES = ["Cama", "Mesa", "Banho", "Cozinha", "Sala", "Eletrodomésticos", "Outros"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const PRIORITY_LABELS: Record<string, string> = { HIGH: "Alta", MEDIUM: "Média", LOW: "Baixa" };
const PRIORITY_COLORS: Record<string, string> = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-amber-100 text-amber-700", LOW: "bg-stone-100 text-stone-600" };
const emptyForm = { name: "", category: "Cama", quantity: "1", quantityOwned: "0", estimatedPrice: "", store: "", priority: "MEDIUM", purchased: false };

export default function TrousseauPage() {
  const [items, setItems] = useState<TrousseauItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TrousseauItem | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("Todos");

  async function load() {
    const d = await fetch("/api/trousseau").then(r => r.json());
    setItems(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`/api/trousseau/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Item atualizado!");
      } else {
        await fetch("/api/trousseau", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Item adicionado!");
      }
      await load(); closeModal();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/trousseau/${id}`, { method: "DELETE" });
    toast.success("Item removido"); await load();
  }

  async function togglePurchased(item: TrousseauItem) {
    await fetch(`/api/trousseau/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchased: !item.purchased }) });
    await load();
  }

  function openEdit(i: TrousseauItem) {
    setEditItem(i);
    setForm({ name: i.name, category: i.category, quantity: String(i.quantity), quantityOwned: String(i.quantityOwned), estimatedPrice: String(i.estimatedPrice), store: i.store || "", priority: i.priority, purchased: i.purchased });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditItem(null); setForm(emptyForm); }

  const filtered = items.filter(i => filterCat === "Todos" || i.category === filterCat);
  const purchased = items.filter(i => i.purchased).length;
  const totalValue = items.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-rose-500" /> Enxoval</h1>
          <p className="text-stone-500 text-sm mt-1">{items.length} itens · {purchased} comprados · {formatCurrency(totalValue)} estimado</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["Todos", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"}`}>{cat}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center"><ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" /><p className="text-stone-400">Nenhum item nesta categoria</p></div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map(item => (
              <div key={item.id} className={`flex items-center gap-3 px-5 py-3 group hover:bg-stone-50 ${item.purchased ? "opacity-60" : ""}`}>
                <button onClick={() => togglePurchased(item)} className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.purchased ? "bg-emerald-500 border-emerald-500" : "border-stone-300 hover:border-rose-400"}`}>
                  {item.purchased && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.purchased ? "line-through text-stone-400" : "text-stone-700"}`}>{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-stone-400">{item.category}</span>
                    {item.store && <span className="text-xs text-stone-400">· {item.store}</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>{PRIORITY_LABELS[item.priority]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-700">{formatCurrency(item.estimatedPrice)}</p>
                  <p className="text-xs text-stone-400">{item.quantityOwned}/{item.quantity} un.</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editItem ? "Editar item" : "Novo item"}</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label><select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Prioridade</label><select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.priority} onChange={e => setForm((p: any) => ({ ...p, priority: e.target.value }))}>{PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Qtd desejada</label><input type="number" min="1" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.quantity} onChange={e => setForm((p: any) => ({ ...p, quantity: e.target.value }))} /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Qtd que tem</label><input type="number" min="0" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.quantityOwned} onChange={e => setForm((p: any) => ({ ...p, quantityOwned: e.target.value }))} /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Preço est.</label><input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.estimatedPrice} onChange={e => setForm((p: any) => ({ ...p, estimatedPrice: e.target.value }))} /></div>
              </div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Loja</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.store} onChange={e => setForm((p: any) => ({ ...p, store: e.target.value }))} /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.purchased} onChange={e => setForm((p: any) => ({ ...p, purchased: e.target.checked }))} className="rounded" /><span className="text-sm text-stone-700">Já comprado</span></label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : editItem ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
