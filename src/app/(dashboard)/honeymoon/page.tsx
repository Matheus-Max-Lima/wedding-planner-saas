"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plane,
  Hotel,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Edit3,
  Save,
  X,
  Package,
} from "lucide-react";

interface HoneymoonActivity {
  id: string;
  title: string;
  description?: string;
  date?: string;
  cost?: number;
  booked: boolean;
  category: string;
}

interface HoneymoonData {
  id?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  notes?: string;
  status?: string;
  activities?: HoneymoonActivity[];
}

const BOOKING_ITEMS = [
  { key: "flight", label: "Passagens", emoji: "✈️" },
  { key: "hotel", label: "Hotel / Hospedagem", emoji: "🏨" },
  { key: "activities", label: "Atividades", emoji: "🎯" },
  { key: "insurance", label: "Seguro Viagem", emoji: "🛡️" },
];

const PACKING_LIST = [
  { category: "Documentos", items: ["Passaporte", "Visto", "Seguro viagem", "Reservas impressas"] },
  { category: "Roupas", items: ["Roupas de praia", "Roupas sociais", "Calçados confortáveis", "Meia e roupas íntimas"] },
  { category: "Higiene", items: ["Protetor solar", "Repelente", "Medicamentos", "Kit primeiros socorros"] },
  { category: "Eletrônicos", items: ["Carregadores", "Adaptador de tomada", "Câmera", "Fones de ouvido"] },
];

const ACTIVITY_CATEGORIES = ["Passeio", "Restaurante", "Spa", "Aventura", "Cultura", "Praia", "Outro"];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function HoneymoonPage() {
  const [data, setData] = useState<HoneymoonData>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<HoneymoonData>({});
  const [saving, setSaving] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    date: "",
    cost: "",
    category: "Passeio",
  });
  const [checkedPacking, setCheckedPacking] = useState<Set<string>>(new Set());
  const [bookingStatus, setBookingStatus] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/honeymoon");
      if (res.ok) {
        const json = await res.json();
        setData(json || {});
        setEditForm(json || {});
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveInfo = async () => {
    setSaving(true);
    const res = await fetch("/api/honeymoon", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const json = await res.json();
      setData(json);
      setEditing(false);
    }
    setSaving(false);
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/honeymoon/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...activityForm,
        cost: activityForm.cost ? parseFloat(activityForm.cost) : undefined,
        booked: false,
      }),
    });
    if (res.ok) {
      const activity = await res.json();
      setData((prev) => ({
        ...prev,
        activities: [...(prev.activities || []), activity],
      }));
      setActivityForm({ title: "", description: "", date: "", cost: "", category: "Passeio" });
      setShowActivityForm(false);
    }
    setSaving(false);
  };

  const toggleActivityBooked = async (act: HoneymoonActivity) => {
    const res = await fetch(`/api/honeymoon/activities/${act.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booked: !act.booked }),
    });
    if (res.ok) {
      setData((prev) => ({
        ...prev,
        activities: prev.activities?.map((a) =>
          a.id === act.id ? { ...a, booked: !a.booked } : a
        ),
      }));
    }
  };

  const deleteActivity = async (id: string) => {
    await fetch(`/api/honeymoon/activities/${id}`, { method: "DELETE" });
    setData((prev) => ({
      ...prev,
      activities: prev.activities?.filter((a) => a.id !== id),
    }));
  };

  const togglePacking = (item: string) => {
    setCheckedPacking((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalActivitiesCost = (data.activities || []).reduce(
    (sum, a) => sum + (a.cost || 0),
    0
  );
  const bookedActivities = (data.activities || []).filter((a) => a.booked).length;

  const nights =
    data.startDate && data.endDate
      ? Math.max(
          0,
          Math.floor(
            (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const allPackingItems = PACKING_LIST.flatMap((c) => c.items);
  const packingPercent =
    allPackingItems.length > 0
      ? Math.round((checkedPacking.size / allPackingItems.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <span>🌙</span> Lua de Mel
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Planeje a viagem dos seus sonhos
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : (
          <>
            {/* Destination Card */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-rose-200" />
                    <span className="text-rose-200 text-sm">Destino</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-1">
                    {data.destination || "A definir"}
                  </h2>
                  {data.startDate && data.endDate && (
                    <p className="text-rose-100 flex items-center gap-1.5 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(data.startDate).toLocaleDateString("pt-BR")} –{" "}
                      {new Date(data.endDate).toLocaleDateString("pt-BR")}
                      {nights > 0 && ` (${nights} noites)`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {data.budget && data.budget > 0 && (
                    <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                      <div className="text-lg font-bold">{formatCurrency(data.budget)}</div>
                      <div className="text-rose-100 text-xs">Orçamento</div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setEditForm(data);
                      setEditing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Editar
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {editing && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-stone-800">Editar Lua de Mel</h2>
                    <button onClick={() => setEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Destino</label>
                      <input
                        value={editForm.destination || ""}
                        onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                        placeholder="Ex: Maldivas, Paris, Cancún..."
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Data de Ida</label>
                        <input
                          type="date"
                          value={editForm.startDate ? editForm.startDate.slice(0, 10) : ""}
                          onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Data de Volta</label>
                        <input
                          type="date"
                          value={editForm.endDate ? editForm.endDate.slice(0, 10) : ""}
                          onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Orçamento (R$)</label>
                      <input
                        type="number"
                        value={editForm.budget || ""}
                        onChange={(e) => setEditForm({ ...editForm, budget: parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
                      <textarea
                        value={editForm.notes || ""}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                        placeholder="Sonhos e ideias para a viagem..."
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setEditing(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
                    <button onClick={saveInfo} disabled={saving} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budget Tracker */}
              <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-rose-500" /> Orçamento
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Total planejado</span>
                    <span className="font-semibold text-stone-800">
                      {formatCurrency(data.budget || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Atividades</span>
                    <span className="font-semibold text-rose-600">
                      {formatCurrency(totalActivitiesCost)}
                    </span>
                  </div>
                  <div className="border-t border-stone-100 pt-3 flex justify-between text-sm">
                    <span className="text-stone-500">Disponível</span>
                    <span className={`font-bold ${(data.budget || 0) - totalActivitiesCost >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {formatCurrency((data.budget || 0) - totalActivitiesCost)}
                    </span>
                  </div>
                </div>
                {data.budget && data.budget > 0 && (
                  <div className="mt-4">
                    <div className="bg-stone-100 rounded-full h-2">
                      <div
                        className="bg-rose-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (totalActivitiesCost / data.budget) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {Math.round((totalActivitiesCost / data.budget) * 100)}% utilizado
                    </p>
                  </div>
                )}
              </div>

              {/* Booking Status */}
              <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500" /> Status das Reservas
                </h3>
                <div className="space-y-3">
                  {BOOKING_ITEMS.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.emoji}</span>
                        <span className="text-sm text-stone-700">{item.label}</span>
                      </div>
                      <button
                        onClick={() =>
                          setBookingStatus((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        className="flex items-center gap-1.5 text-xs"
                      >
                        {bookingStatus[item.key] ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Reservado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-500 rounded-full">
                            <Circle className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-stone-400">
                  {Object.values(bookingStatus).filter(Boolean).length} de {BOOKING_ITEMS.length} reservados
                </div>
              </div>

              {/* Packing Checklist */}
              <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-500" /> Mala
                  </h3>
                  <span className="text-xs text-stone-400">{packingPercent}% preparada</span>
                </div>
                <div className="bg-stone-100 rounded-full h-1.5 mb-4">
                  <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${packingPercent}%` }} />
                </div>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {PACKING_LIST.map((cat) => (
                    <div key={cat.category}>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                        {cat.category}
                      </p>
                      <div className="space-y-1">
                        {cat.items.map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checkedPacking.has(item)}
                              onChange={() => togglePacking(item)}
                              className="w-3.5 h-3.5 accent-rose-500"
                            />
                            <span className={`text-xs ${checkedPacking.has(item) ? "line-through text-stone-300" : "text-stone-600"}`}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities / Itinerary */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-stone-800 text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" /> Atividades e Itinerário
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {bookedActivities} de {(data.activities || []).length} atividades reservadas
                  </p>
                </div>
                <button
                  onClick={() => setShowActivityForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>

              {(data.activities || []).length === 0 ? (
                <div className="text-center py-10 text-stone-400">
                  <Plane className="w-10 h-10 mx-auto mb-3 text-stone-200" />
                  <p className="text-sm">Nenhuma atividade planejada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(data.activities || []).map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 hover:bg-rose-50/50 transition-colors group"
                    >
                      <button onClick={() => toggleActivityBooked(act)} className="flex-shrink-0">
                        {act.booked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${act.booked ? "line-through text-stone-400" : "text-stone-800"}`}>
                          {act.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full">{act.category}</span>
                          {act.date && (
                            <span className="text-xs text-stone-400">
                              {new Date(act.date).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          {act.description && (
                            <span className="text-xs text-stone-400 truncate">{act.description}</span>
                          )}
                        </div>
                      </div>
                      {act.cost && act.cost > 0 && (
                        <span className="text-sm font-semibold text-stone-700 flex-shrink-0">
                          {formatCurrency(act.cost)}
                        </span>
                      )}
                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 text-stone-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Activity Modal */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Nova Atividade</h2>
              <button onClick={() => setShowActivityForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={addActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input
                  required
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="Ex: Jantar romântico na praia"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    {ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Custo estimado (R$)</label>
                <input
                  type="number"
                  value={activityForm.cost}
                  onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  rows={2}
                  placeholder="Detalhes da atividade..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowActivityForm(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
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
