"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grid3X3, Plus, Trash2, Edit2, Users } from "lucide-react";

interface TableGuest { id: string; name: string; status: string; }
interface Table { id: string; name: string; capacity: number; shape: string; notes: string | null; guests: TableGuest[]; }

const SHAPES = ["ROUND", "RECTANGULAR", "SQUARE"];
const SHAPE_LABELS: Record<string, string> = { ROUND: "Redonda", RECTANGULAR: "Retangular", SQUARE: "Quadrada" };
const emptyForm = { name: "", capacity: "8", shape: "ROUND", notes: "" };

export default function SeatingPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const d = await fetch("/api/seating/tables").then(r => r.json());
    setTables(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      if (editTable) {
        await fetch(`/api/seating/tables/${editTable.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Mesa atualizada!");
      } else {
        await fetch("/api/seating/tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Mesa criada!");
      }
      await load(); closeModal();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  }

  async function deleteTable(id: string) {
    await fetch(`/api/seating/tables/${id}`, { method: "DELETE" });
    toast.success("Mesa removida"); await load();
  }

  function openEdit(t: Table) {
    setEditTable(t);
    setForm({ name: t.name, capacity: String(t.capacity), shape: t.shape, notes: t.notes || "" });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditTable(null); setForm(emptyForm); }

  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0);
  const totalSeated = tables.reduce((s, t) => s + t.guests.length, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><Grid3X3 className="w-6 h-6 text-rose-500" /> Mapa de Mesas</h1>
          <p className="text-stone-500 text-sm mt-1">{tables.length} mesas · {totalSeated}/{totalCapacity} lugares ocupados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"><Plus className="w-4 h-4" /> Nova mesa</button>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Grid3X3 className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 mb-4">Nenhuma mesa criada ainda</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm hover:bg-rose-600">Criar primeira mesa</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(table => {
            const occupancy = table.guests.length;
            const pct = Math.min(100, (occupancy / table.capacity) * 100);
            const isFull = occupancy >= table.capacity;
            return (
              <div key={table.id} className={`bg-white rounded-2xl border ${isFull ? "border-emerald-200" : "border-stone-100"} p-5 hover:shadow-sm transition-all group`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-stone-800">{table.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">{SHAPE_LABELS[table.shape]} · {table.capacity} lugares</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(table)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteTable(table.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5 mb-2">
                  <div className={`h-1.5 rounded-full transition-all ${isFull ? "bg-emerald-500" : "bg-rose-400"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-stone-500 mb-3"><span className="font-medium text-stone-700">{occupancy}</span> de {table.capacity} lugares</p>
                {table.guests.length > 0 && (
                  <div className="space-y-1">
                    {table.guests.map(g => (
                      <div key={g.id} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-rose-600 text-xs font-medium">{g.name.charAt(0)}</span>
                        </div>
                        <span className="text-xs text-stone-600">{g.name}</span>
                        <span className={`ml-auto text-xs ${g.status === "CONFIRMED" ? "text-emerald-600" : g.status === "DECLINED" ? "text-red-500" : "text-amber-500"}`}>
                          {g.status === "CONFIRMED" ? "✓" : g.status === "DECLINED" ? "✗" : "?"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {table.notes && <p className="text-xs text-stone-400 mt-2 italic">{table.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editTable ? "Editar mesa" : "Nova mesa"}</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Ex: Mesa 1, Mesa da Família..." value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Capacidade</label><input type="number" min="1" max="30" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.capacity} onChange={e => setForm((p: any) => ({ ...p, capacity: e.target.value }))} /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Formato</label><select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.shape} onChange={e => setForm((p: any) => ({ ...p, shape: e.target.value }))}>{SHAPES.map(s => <option key={s} value={s}>{SHAPE_LABELS[s]}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Notas</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.notes} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : editTable ? "Salvar" : "Criar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
