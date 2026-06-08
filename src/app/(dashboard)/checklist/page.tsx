"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckSquare,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Filter,
  GripVertical,
  FileText,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  month: number;
  completed: boolean;
  priority: string;
}

const CATEGORIES = [
  "Todos",
  "Cerimônia",
  "Recepção",
  "Visual",
  "Documentos",
  "Lua de Mel",
  "Fornecedores",
  "Convites",
  "Decoração",
  "Música",
  "Alimentação",
  "Geral",
];

const PRIORITIES = [
  { value: "high", label: "Alta", color: "bg-red-100 text-red-600 border-red-200" },
  { value: "medium", label: "Média", color: "bg-amber-100 text-amber-600 border-amber-200" },
  { value: "low", label: "Baixa", color: "bg-stone-100 text-stone-500 border-stone-200" },
];

const MONTH_LABELS: Record<number, string> = {
  12: "12 meses antes",
  11: "11 meses antes",
  10: "10 meses antes",
  9: "9 meses antes",
  8: "8 meses antes",
  7: "7 meses antes",
  6: "6 meses antes",
  5: "5 meses antes",
  4: "4 meses antes",
  3: "3 meses antes",
  2: "2 meses antes",
  1: "1 mês antes",
};

function getPriorityStyle(priority: string) {
  return (
    PRIORITIES.find((p) => p.value === priority)?.color ||
    "bg-stone-100 text-stone-500 border-stone-200"
  );
}

function getPriorityLabel(priority: string) {
  return PRIORITIES.find((p) => p.value === priority)?.label || priority;
}

// ─── SortableItem ─────────────────────────────────────────────────────────────

interface SortableItemProps {
  item: ChecklistItem;
  togglingId: string | null;
  deletingId: string | null;
  onToggle: (item: ChecklistItem) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ item, togglingId, deletingId, onToggle, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all group ${
        item.completed
          ? "bg-stone-50 border-stone-100"
          : "bg-white border-stone-100 hover:border-rose-100 hover:bg-rose-50/30"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 flex-shrink-0 text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing focus:outline-none print:hidden"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(item)}
        disabled={togglingId === item.id}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          item.completed
            ? "bg-rose-500 border-rose-500"
            : "border-stone-300 hover:border-rose-400"
        } ${togglingId === item.id ? "opacity-50" : ""}`}
      >
        {togglingId === item.id ? (
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        ) : item.completed ? (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium transition-all ${
            item.completed ? "line-through text-stone-400" : "text-stone-700"
          }`}
        >
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-stone-400 mt-0.5 truncate">{item.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-md">
            {item.category}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getPriorityStyle(
              item.priority
            )}`}
          >
            {getPriorityLabel(item.priority)}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        disabled={deletingId === item.id}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 disabled:opacity-50 print:hidden"
      >
        {deletingId === item.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [brideName, setBrideName] = useState("Noiva");
  const [groomName, setGroomName] = useState("Noivo");

  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "done">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedMonths, setCollapsedMonths] = useState<Set<number>>(new Set());

  const [showAddForm, setShowAddForm] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "Geral",
    month: 6,
    priority: "medium",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Inject print styles
  useEffect(() => {
    const id = "checklist-print-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media print {
        /* Hide UI chrome */
        nav, aside, header, [data-sidebar],
        .print\\:hidden,
        button.print\\:hidden { display: none !important; }

        body { background: white !important; color: black !important; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        /* Print header */
        #checklist-print-header {
          display: block !important;
          text-align: center;
          padding: 16px 0 24px;
          border-bottom: 2px solid #000;
          margin-bottom: 24px;
          font-family: serif;
        }
        #checklist-print-header h1 {
          font-size: 22pt;
          margin: 0 0 4px;
        }
        #checklist-print-header p {
          font-size: 11pt;
          color: #555;
          margin: 0;
        }

        /* Clean up cards */
        .bg-white { background: white !important; }
        .shadow-sm, .shadow-lg { box-shadow: none !important; }
        .rounded-2xl, .rounded-xl { border-radius: 0 !important; }

        /* Items */
        .checklist-item-row {
          border: none !important;
          border-bottom: 1px solid #eee !important;
          padding: 6px 0 !important;
          background: white !important;
        }
        .checklist-item-row .text-stone-400 { color: #000 !important; text-decoration: none !important; }
        .line-through { text-decoration: line-through; }

        /* Progress bars hidden */
        .bg-gradient-to-r, .bg-stone-100.rounded-full { display: none !important; }

        /* Month group */
        .month-group-header { page-break-inside: avoid; }
        .month-group { page-break-inside: avoid; margin-bottom: 16px; }
      }
      #checklist-print-header { display: none; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [checklistRes, settingsRes] = await Promise.all([
        fetch("/api/checklist"),
        fetch("/api/settings"),
      ]);
      if (!checklistRes.ok) throw new Error("Erro ao carregar checklist");
      const data = await checklistRes.json();
      setItems(data);
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setBrideName(settings.wedding?.brideName || settings.brideName || "Noiva");
        setGroomName(settings.wedding?.groomName || settings.groomName || "Noivo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleItem = async (item: ChecklistItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/checklist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar item");
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch {
      // Revert optimistic update if needed
    } finally {
      setTogglingId(null);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Deseja remover esta tarefa?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/checklist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover item");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Erro ao remover item");
    } finally {
      setDeletingId(null);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    setAddingItem(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error("Erro ao criar item");
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setNewItem({
        title: "",
        description: "",
        category: "Geral",
        month: 6,
        priority: "medium",
      });
      setShowAddForm(false);
    } catch {
      alert("Erro ao criar item");
    } finally {
      setAddingItem(false);
    }
  };

  const toggleMonthCollapse = (month: number) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent, monthItems: ChecklistItem[], month: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = monthItems.findIndex((i) => i.id === active.id);
    const newIndex = monthItems.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(monthItems, oldIndex, newIndex);

    // Update local state preserving items from other months
    setItems((prev) => {
      const otherItems = prev.filter((i) => i.month !== month);
      return [...otherItems, ...reordered];
    });

    // Fire PATCH for each reordered item with its new order index (best-effort)
    reordered.forEach((item, index) => {
      fetch(`/api/checklist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      }).catch(() => {});
    });
  };

  const handleExportPDF = () => {
    document.title = `Checklist - ${brideName} & ${groomName}`;
    const header = document.getElementById("checklist-print-header");
    if (header) header.style.display = "block";
    window.print();
    setTimeout(() => {
      document.title = "Checklist do Casamento";
      if (header) header.style.display = "none";
    }, 500);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterCategory !== "Todos" && item.category !== filterCategory)
      return false;
    if (filterStatus === "pending" && item.completed) return false;
    if (filterStatus === "done" && !item.completed) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const allMonths = Array.from({ length: 12 }, (_, i) => 12 - i);

  const grouped = allMonths.reduce<Record<number, ChecklistItem[]>>((acc, month) => {
    const monthItems = filteredItems.filter((i) => i.month === month);
    if (monthItems.length > 0) acc[month] = monthItems;
    return acc;
  }, {});

  const totalCompleted = items.filter((i) => i.completed).length;
  const totalItems = items.length;
  const overallPercent =
    totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-rose-400 animate-spin mx-auto mb-3" />
          <p className="text-stone-500">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchItems}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Print header (hidden on screen, shown when printing) */}
      <div id="checklist-print-header" style={{ display: "none" }}>
        <h1>Até o Altar — Checklist de {brideName} &amp; {groomName}</h1>
        <p>Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <CheckSquare className="w-7 h-7 text-rose-500" />
              Checklist do Casamento
            </h1>
            <p className="text-stone-500 mt-0.5">
              {totalCompleted} de {totalItems} tarefas concluídas
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-stone-700">
              Progresso Geral
            </span>
            <span className="text-lg font-bold text-rose-500">
              {overallPercent}%
            </span>
          </div>
          <div className="bg-stone-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-rose-400 to-rose-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>{totalCompleted} concluídas</span>
            <span>{totalItems - totalCompleted} pendentes</span>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden print:hidden">
            <div className="bg-gradient-to-r from-rose-50 to-rose-50/50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Nova Tarefa</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={addItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Ex: Contratar fotógrafo"
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Detalhes sobre a tarefa..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== "Todos").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Meses antes
                  </label>
                  <select
                    value={newItem.month}
                    onChange={(e) =>
                      setNewItem((p) => ({
                        ...p,
                        month: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => 12 - i).map((m) => (
                      <option key={m} value={m}>
                        {m} {m === 1 ? "mês" : "meses"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Prioridade
                  </label>
                  <select
                    value={newItem.priority}
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, priority: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addingItem || !newItem.title.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {addingItem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar Tarefa
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3 print:hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              {[
                { value: "all", label: "Todas" },
                { value: "pending", label: "Pendentes" },
                { value: "done", label: "Concluídas" },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value as typeof filterStatus)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === s.value
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1 text-stone-400">
              <Filter className="w-4 h-4" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    filterCategory === cat
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "bg-white text-stone-500 border-stone-200 hover:border-rose-200 hover:text-rose-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items by Month */}
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-stone-100 shadow-sm text-center">
            <CheckSquare className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">Nenhuma tarefa encontrada</p>
            <p className="text-stone-400 text-sm mt-1">
              {searchQuery || filterCategory !== "Todos" || filterStatus !== "all"
                ? "Tente ajustar os filtros"
                : "Adicione sua primeira tarefa clicando em 'Nova Tarefa'"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([monthStr, monthItems]) => {
                const month = Number(monthStr);
                const completedInMonth = monthItems.filter(
                  (i) => i.completed
                ).length;
                const percentInMonth =
                  monthItems.length > 0
                    ? Math.round(
                        (completedInMonth / monthItems.length) * 100
                      )
                    : 0;
                const isCollapsed = collapsedMonths.has(month);

                return (
                  <div
                    key={month}
                    className="month-group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
                  >
                    {/* Month header */}
                    <button
                      onClick={() => toggleMonthCollapse(month)}
                      className="month-group-header w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors print:hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                          <span className="text-rose-600 font-bold text-sm">
                            {month}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-stone-800">
                            {MONTH_LABELS[month] || `${month} meses antes`}
                          </h3>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {completedInMonth} de {monthItems.length} tarefas concluídas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Mini progress */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-24 bg-stone-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-rose-400 transition-all"
                              style={{ width: `${percentInMonth}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500 font-medium w-8 text-right">
                            {percentInMonth}%
                          </span>
                        </div>
                        {isCollapsed ? (
                          <ChevronDown className="w-5 h-5 text-stone-400" />
                        ) : (
                          <ChevronUp className="w-5 h-5 text-stone-400" />
                        )}
                      </div>
                    </button>

                    {/* Print-only month header */}
                    <div className="hidden print:block p-4 border-b border-stone-200">
                      <h3 className="font-bold text-stone-800 text-base">
                        {MONTH_LABELS[month] || `${month} meses antes`}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {completedInMonth} de {monthItems.length} tarefas concluídas
                      </p>
                    </div>

                    {/* Month progress bar */}
                    <div className="px-5 pb-0 print:hidden">
                      <div className="bg-stone-100 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
                          style={{ width: `${percentInMonth}%` }}
                        />
                      </div>
                    </div>

                    {/* Items with DnD */}
                    {!isCollapsed && (
                      <div className="p-5 pt-4 space-y-2">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) =>
                            handleDragEnd(event, monthItems, month)
                          }
                        >
                          <SortableContext
                            items={monthItems.map((i) => i.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {monthItems.map((item) => (
                              <SortableItem
                                key={item.id}
                                item={item}
                                togglingId={togglingId}
                                deletingId={deletingId}
                                onToggle={toggleItem}
                                onDelete={deleteItem}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}

                    {/* Print: always show items */}
                    <div className="hidden print:block p-4 space-y-1">
                      {monthItems.map((item) => (
                        <div key={item.id} className="checklist-item-row flex items-center gap-2 py-1">
                          <span className="w-4 h-4 border border-stone-400 rounded flex-shrink-0 flex items-center justify-center text-xs">
                            {item.completed ? "✓" : ""}
                          </span>
                          <span className={`text-sm ${item.completed ? "line-through text-stone-400" : "text-stone-800"}`}>
                            {item.title}
                          </span>
                          <span className="text-xs text-stone-400 ml-auto">{item.category}</span>
                        </div>
                      ))}
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
