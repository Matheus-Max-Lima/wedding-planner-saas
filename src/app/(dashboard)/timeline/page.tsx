"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Plus, Trash2, Edit2, MapPin, User } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  location: string | null;
  responsible: string | null;
  category: string;
  order: number;
}

const CATEGORIES = ["Cerimônia", "Recepção", "Fotos", "Deslocamento", "Preparativos", "Outros"];
const emptyForm = { title: "", description: "", startTime: "", endTime: "", location: "", responsible: "", category: "Cerimônia", order: 0 };

const CATEGORY_COLORS: Record<string, string> = {
  "Cerimônia": "bg-rose-100 text-rose-700",
  "Recepção": "bg-purple-100 text-purple-700",
  "Fotos": "bg-blue-100 text-blue-700",
  "Deslocamento": "bg-amber-100 text-amber-700",
  "Preparativos": "bg-emerald-100 text-emerald-700",
  "Outros": "bg-stone-100 text-stone-700",
};

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/timeline").then(r => r.json());
    setItems(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.title.trim() || !form.startTime) return toast.error("Título e horário são obrigatórios");
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`/api/timeline/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Item atualizado!");
      } else {
        await fetch("/api/timeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Item adicionado!");
      }
      await load();
      closeModal();
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/timeline/${id}`, { method: "DELETE" });
    toast.success("Item removido");
    await load();
  }

  function openEdit(item: TimelineItem) {
    setEditItem(item);
    setForm({ title: item.title, description: item.description || "", startTime: item.startTime, endTime: item.endTime || "", location: item.location || "", responsible: item.responsible || "", category: item.category, order: item.order });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    setForm(emptyForm);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><Clock className="w-6 h-6 text-rose-500" /> Cronograma</h1>
          <p className="text-stone-500 text-sm mt-1">Organize o roteiro do dia do casamento</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Nenhum item no cronograma ainda.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm hover:bg-rose-600">Adicionar primeiro item</button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-stone-200" />
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-16 text-right flex-shrink-0">
                  <span className="text-sm font-bold text-stone-700">{item.startTime}</span>
                  {item.endTime && <p className="text-xs text-stone-400">{item.endTime}</p>}
                </div>
                <div className="relative z-10 w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-white" style={{ backgroundColor: "#f43f5e" }} />
                <div className="flex-1 bg-white rounded-2xl border border-stone-100 p-4 hover:border-rose-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-800">{item.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || "bg-stone-100 text-stone-600"}`}>{item.category}</span>
                      </div>
                      {item.description && <p className="text-sm text-stone-500 mt-1">{item.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {item.location && <span className="flex items-center gap-1 text-xs text-stone-400"><MapPin className="w-3 h-3" />{item.location}</span>}
                        {item.responsible && <span className="flex items-center gap-1 text-xs text-stone-400"><User className="w-3 h-3" />{item.responsible}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editItem ? "Editar item" : "Novo item"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Horário início *</label>
                  <input type="time" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.startTime} onChange={e => setForm((p: any) => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Horário fim</label>
                  <input type="time" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.endTime} onChange={e => setForm((p: any) => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Local</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.location} onChange={e => setForm((p: any) => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Responsável</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.responsible} onChange={e => setForm((p: any) => ({ ...p, responsible: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
                <textarea rows={2} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} />
              </div>
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
