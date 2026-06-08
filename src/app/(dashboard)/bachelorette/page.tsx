"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PartyPopper,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface BacheloretteActivity {
  id: string;
  title: string;
  description?: string;
  time?: string;
  cost?: number;
  confirmed: boolean;
  order: number;
}

interface BacheloretteGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  confirmed: boolean;
}

interface BacheloretteData {
  id?: string;
  type?: string;
  date?: string;
  location?: string;
  budget?: number;
  theme?: string;
  notes?: string;
  activities?: BacheloretteActivity[];
  guests?: BacheloretteGuest[];
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function BachelorettePage() {
  const [data, setData] = useState<BacheloretteData>({ type: "bachelorette" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<BacheloretteData>({ type: "bachelorette" });
  const [saving, setSaving] = useState(false);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ title: "", description: "", time: "", cost: "" });

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestForm, setGuestForm] = useState({ name: "", email: "", phone: "" });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/bachelorette");
      if (res.ok) {
        const json = await res.json();
        if (json) {
          setData(json);
          setEditForm(json);
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveInfo = async () => {
    setSaving(true);
    const res = await fetch("/api/bachelorette", {
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
    const res = await fetch("/api/bachelorette/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...activityForm,
        cost: activityForm.cost ? parseFloat(activityForm.cost) : undefined,
        confirmed: false,
        order: (data.activities || []).length,
      }),
    });
    if (res.ok) {
      const act = await res.json();
      setData((prev) => ({ ...prev, activities: [...(prev.activities || []), act] }));
      setActivityForm({ title: "", description: "", time: "", cost: "" });
      setShowActivityForm(false);
    }
    setSaving(false);
  };

  const toggleActivity = async (act: BacheloretteActivity) => {
    await fetch(`/api/bachelorette/activities/${act.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed: !act.confirmed }),
    });
    setData((prev) => ({
      ...prev,
      activities: prev.activities?.map((a) =>
        a.id === act.id ? { ...a, confirmed: !a.confirmed } : a
      ),
    }));
  };

  const deleteActivity = async (id: string) => {
    await fetch(`/api/bachelorette/activities/${id}`, { method: "DELETE" });
    setData((prev) => ({
      ...prev,
      activities: prev.activities?.filter((a) => a.id !== id),
    }));
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/bachelorette/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...guestForm, confirmed: false }),
    });
    if (res.ok) {
      const guest = await res.json();
      setData((prev) => ({ ...prev, guests: [...(prev.guests || []), guest] }));
      setGuestForm({ name: "", email: "", phone: "" });
      setShowGuestForm(false);
    }
    setSaving(false);
  };

  const toggleGuest = async (guest: BacheloretteGuest) => {
    await fetch(`/api/bachelorette/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed: !guest.confirmed }),
    });
    setData((prev) => ({
      ...prev,
      guests: prev.guests?.map((g) =>
        g.id === guest.id ? { ...g, confirmed: !g.confirmed } : g
      ),
    }));
  };

  const deleteGuest = async (id: string) => {
    await fetch(`/api/bachelorette/guests/${id}`, { method: "DELETE" });
    setData((prev) => ({
      ...prev,
      guests: prev.guests?.filter((g) => g.id !== id),
    }));
  };

  const isBachelorette = (data.type || "bachelorette") === "bachelorette";
  const totalCost = (data.activities || []).reduce((sum, a) => sum + (a.cost || 0), 0);
  const confirmedGuests = (data.guests || []).filter((g) => g.confirmed).length;
  const confirmedActivities = (data.activities || []).filter((a) => a.confirmed).length;

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <PartyPopper className="w-6 h-6 text-rose-500" />
              {isBachelorette ? "Despedida de Solteira" : "Despedida de Solteiro"}
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Planeje a festa perfeita antes do grande dia
            </p>
          </div>
          <button
            onClick={() => { setEditForm(data); setEditing(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
          >
            <Edit3 className="w-4 h-4" /> Editar informações
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : (
          <>
            {/* Info Banner */}
            <div className={`rounded-2xl p-6 ${isBachelorette ? "bg-gradient-to-br from-rose-500 to-pink-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"} text-white shadow-xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs opacity-70 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Data
                  </p>
                  <p className="font-bold text-sm">
                    {data.date ? new Date(data.date).toLocaleDateString("pt-BR") : "A definir"}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Local
                  </p>
                  <p className="font-bold text-sm">{data.location || "A definir"}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">Tema</p>
                  <p className="font-bold text-sm">{data.theme || "A definir"}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Orçamento
                  </p>
                  <p className="font-bold text-sm">{formatCurrency(data.budget || 0)}</p>
                </div>
              </div>
              {/* Type toggle */}
              <div className="relative mt-4 flex gap-2">
                {["bachelorette", "bachelor"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setData({ ...data, type: t })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      data.type === t ? "bg-white text-stone-800" : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {t === "bachelorette" ? "👰 Noiva" : "🤵 Noivo"}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-500" /> Resumo do Orçamento
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-stone-50 rounded-xl">
                  <p className="text-lg font-bold text-stone-800">{formatCurrency(data.budget || 0)}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Orçamento total</p>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <p className="text-lg font-bold text-rose-600">{formatCurrency(totalCost)}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Custo atividades</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className={`text-lg font-bold ${(data.budget || 0) - totalCost >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatCurrency((data.budget || 0) - totalCost)}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Disponível</p>
                </div>
              </div>
              {data.budget && data.budget > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>Utilizado</span>
                    <span>{Math.round((totalCost / data.budget) * 100)}%</span>
                  </div>
                  <div className="bg-stone-100 rounded-full h-2">
                    <div
                      className="bg-rose-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalCost / data.budget) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activities */}
              <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                      <PartyPopper className="w-4 h-4 text-rose-500" /> Atividades
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {confirmedActivities} de {(data.activities || []).length} confirmadas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {(data.activities || []).length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-sm">Nenhuma atividade ainda</div>
                ) : (
                  <div className="space-y-2">
                    {[...(data.activities || [])].sort((a, b) => a.order - b.order).map((act) => (
                      <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-rose-50/50 group transition-colors">
                        <button onClick={() => toggleActivity(act)} className="flex-shrink-0">
                          {act.confirmed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${act.confirmed ? "line-through text-stone-400" : "text-stone-800"}`}>
                            {act.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {act.time && <span className="text-xs text-stone-400">{act.time}</span>}
                            {act.cost != null && act.cost > 0 && (
                              <span className="text-xs text-rose-500 font-medium">{formatCurrency(act.cost)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteActivity(act.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guest List */}
              <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-500" /> Convidados
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {confirmedGuests} de {(data.guests || []).length} confirmados
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGuestForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {(data.guests || []).length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-sm">Nenhum convidado ainda</div>
                ) : (
                  <div className="space-y-2">
                    {(data.guests || []).map((guest) => (
                      <div key={guest.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-rose-50/50 group transition-colors">
                        <button onClick={() => toggleGuest(guest)} className="flex-shrink-0">
                          {guest.confirmed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800">{guest.name}</p>
                          {guest.phone && (
                            <p className="text-xs text-stone-400">{guest.phone}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${guest.confirmed ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
                          {guest.confirmed ? "Confirmado" : "Pendente"}
                        </span>
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Editar Despedida</h2>
              <button onClick={() => setEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo</label>
                <div className="flex gap-3">
                  {["bachelorette", "bachelor"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditForm({ ...editForm, type: t })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${editForm.type === t ? "border-rose-500 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-500"}`}
                    >
                      {t === "bachelorette" ? "👰 Noiva" : "🤵 Noivo"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Data</label>
                <input
                  type="date"
                  value={editForm.date ? editForm.date.slice(0, 10) : ""}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Local</label>
                <input
                  value={editForm.location || ""}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Ex: SPA, Restaurante, Casa da amiga..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tema</label>
                <input
                  value={editForm.theme || ""}
                  onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                  placeholder="Ex: Praia, Las Vegas, Pijama party..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
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
                  rows={2}
                  placeholder="Ideias e observações..."
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Atividade *</label>
                <input
                  required
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="Ex: Spa, Jantar, Passeio de barco..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Horário</label>
                  <input
                    value={activityForm.time}
                    onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                    placeholder="Ex: 14:00"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  rows={2}
                  placeholder="Detalhes..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowActivityForm(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-50">
                  {saving ? "..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Adicionar Convidado</h2>
              <button onClick={() => setShowGuestForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={addGuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
                <input
                  required
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
                <input
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGuestForm(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-50">
                  {saving ? "..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
