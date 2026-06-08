"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckSquare, Plus, Trash2, Filter } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  dueDate: string | null;
  notes: string | null;
}

const CATEGORIES = ["Todos", "Local", "Buffet", "Fotografia", "Musica", "Decoracao", "Vestido", "Documentos", "Outros"];

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Outros", dueDate: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/checklist").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  async function toggle(item: ChecklistItem) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i));
    await fetch(`/api/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
  }

  async function addItem() {
    if (!form.title.trim()) return toast.error("Titulo obrigatorio");
    setSaving(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const item = await res.json();
      setItems(prev => [...prev, item]);
      setForm({ title: "", category: "Outros", dueDate: "", notes: "" });
      setShowAdd(false);
      toast.success("Tarefa adicionada!");
    } catch { toast.error("Erro ao adicionar"); }
    finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/checklist/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Tarefa removida");
  }

  const filtered = items
    .filter(i => filter === "Todos" || i.category === filter)
    .filter(i => showCompleted || !i.completed);

  const completedCount = items.filter(i => i.completed).length;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const byCategory = CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = filtered.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-rose-500" /> Checklist
          </h1>
          <p className="text-stone-500 text-sm mt-1">{completedCount} de {items.length} tarefas concluidas</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"
        >
          <Plus className="w-4 h-4" /> Nova tarefa
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-600">Progresso geral</span>
          <span className="text-sm font-bold text-rose-500">{pct}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2.5">
          <div className="bg-rose-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === cat ? "bg-rose-500 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-rose-300"
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowCompleted(p => !p)}
          className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${
            !showCompleted ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200"
          }`}
        >
          <Filter className="w-3 h-3" />
          {showCompleted ? "Ocultar concluidas" : "Mostrar concluidas"}
        </button>
      </div>

      {/* Items by category */}
      {filter === "Todos" ? (
        Object.entries(byCategory).map(([cat, catItems]) =>
          catItems.length === 0 ? null : (
            <div key={cat} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                <h3 className="text-sm font-semibold text-stone-600">{cat}</h3>
              </div>
              <div className="divide-y divide-stone-50">
                {catItems.map(item => (
                  <ItemRow key={item.id} item={item} onToggle={toggle} onDelete={deleteItem} />
                ))}
              </div>
            </div>
          )
        )
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="divide-y divide-stone-50">
            {filtered.length === 0 ? (
              <p className="text-center text-stone-400 py-10">Nenhuma tarefa nesta categoria</p>
            ) : filtered.map(item => (
              <ItemRow key={item.id} item={item} onToggle={toggle} onDelete={deleteItem} />
            ))}
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Nova tarefa</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Titulo *</label>
                <input
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Ex: Confirmar buffet"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                <select
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Data limite</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.dueDate}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
                <textarea
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">
                Cancelar
              </button>
              <button
                onClick={addItem}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onToggle, onDelete }: {
  item: ChecklistItem;
  onToggle: (item: ChecklistItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 group hover:bg-stone-50 ${item.completed ? "opacity-60" : ""}`}>
      <button
        onClick={() => onToggle(item)}
        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
          item.completed ? "bg-emerald-500 border-emerald-500" : "border-stone-300 hover:border-rose-400"
        }`}
      >
        {item.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.completed ? "line-through text-stone-400" : "text-stone-700"}`}>
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-stone-400">{item.category}</span>
          {item.dueDate && (
            <span className="text-xs text-stone-400">· {new Date(item.dueDate).toLocaleDateString("pt-BR")}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
