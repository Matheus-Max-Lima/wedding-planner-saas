"use client";

import { useEffect, useState, useCallback } from "react";
import { Grid3X3, Plus, Trash2, Users, X, ChevronDown } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  tableId?: string;
  status: string;
}

interface Table {
  id: string;
  name: string;
  shape: string;
  capacity: number;
  notes?: string;
  guests: Guest[];
}

export default function SeatingPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTableForm, setShowTableForm] = useState(false);
  const [tableForm, setTableForm] = useState({ name: "", shape: "round", capacity: "8", notes: "" });
  const [saving, setSaving] = useState(false);
  const [assigningGuest, setAssigningGuest] = useState<string | null>(null); // guestId
  const [selectedTable, setSelectedTable] = useState<Record<string, string>>({}); // guestId -> tableId

  const fetchData = useCallback(async () => {
    try {
      const [tablesRes, guestsRes] = await Promise.all([
        fetch("/api/seating"),
        fetch("/api/guests"),
      ]);
      if (tablesRes.ok) setTables(await tablesRes.json());
      if (guestsRes.ok) setAllGuests(await guestsRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/seating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tableForm, capacity: parseInt(tableForm.capacity) || 8 }),
    });
    if (res.ok) {
      const table = await res.json();
      setTables((prev) => [...prev, table]);
      setTableForm({ name: "", shape: "round", capacity: "8", notes: "" });
      setShowTableForm(false);
    }
    setSaving(false);
  };

  const deleteTable = async (id: string) => {
    await fetch(`/api/seating/${id}`, { method: "DELETE" });
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const assignGuestToTable = async (guestId: string, tableId: string) => {
    const res = await fetch(`/api/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: tableId || null }),
    });
    if (res.ok) {
      // Re-fetch to update both tables and guests
      setAllGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, tableId: tableId || undefined } : g))
      );
      setTables((prev) =>
        prev.map((t) => ({
          ...t,
          guests: tableId === t.id
            ? [...t.guests.filter((g) => g.id !== guestId), { ...allGuests.find((g) => g.id === guestId)!, tableId: t.id }]
            : t.guests.filter((g) => g.id !== guestId),
        }))
      );
      setAssigningGuest(null);
    }
  };

  const unassignGuest = async (guestId: string) => {
    await assignGuestToTable(guestId, "");
  };

  const unassignedGuests = allGuests.filter((g) => !g.tableId);
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const assignedCount = allGuests.filter((g) => g.tableId).length;

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Grid3X3 className="w-6 h-6 text-rose-500" /> Disposição das Mesas
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Organize os convidados nas mesas do salão
            </p>
          </div>
          <button
            onClick={() => setShowTableForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
          >
            <Plus className="w-4 h-4" /> Adicionar mesa
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-stone-800">{tables.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Mesas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-stone-800">{totalSeats}</p>
            <p className="text-xs text-stone-400 mt-0.5">Lugares totais</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{assignedCount}</p>
            <p className="text-xs text-stone-400 mt-0.5">Alocados</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-rose-500">{unassignedGuests.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Sem mesa</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tables Grid */}
            <div className="lg:col-span-3">
              {tables.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm text-center">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-stone-200" />
                  <p className="text-stone-500 font-medium">Nenhuma mesa criada</p>
                  <p className="text-stone-400 text-sm mt-1">Adicione as mesas do seu salão</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tables.map((table) => {
                    const occupancy = table.guests.length;
                    const percent = Math.round((occupancy / table.capacity) * 100);
                    const isFull = occupancy >= table.capacity;

                    return (
                      <div
                        key={table.id}
                        className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
                      >
                        {/* Table Header */}
                        <div className={`px-4 py-3 border-b border-stone-100 flex items-center justify-between ${isFull ? "bg-rose-50" : "bg-stone-50"}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{table.shape === "round" ? "⭕" : "⬜"}</span>
                              <h3 className="font-semibold text-stone-800 text-sm">{table.name}</h3>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {occupancy}/{table.capacity} lugares ·{" "}
                              {table.shape === "round" ? "Redonda" : "Retangular"}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteTable(table.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Capacity bar */}
                        <div className="px-4 pt-3">
                          <div className="bg-stone-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${isFull ? "bg-rose-400" : "bg-emerald-400"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Guests */}
                        <div className="p-4 space-y-1.5 min-h-[80px]">
                          {table.guests.length === 0 ? (
                            <p className="text-xs text-stone-300 text-center py-2">Sem convidados</p>
                          ) : (
                            table.guests.map((guest) => (
                              <div
                                key={guest.id}
                                className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-stone-50 rounded-lg group"
                              >
                                <span className="text-xs text-stone-700 truncate">{guest.name}</span>
                                <button
                                  onClick={() => unassignGuest(guest.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-red-500 flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          )}
                          {!isFull && (
                            <div className="text-center pt-1">
                              <span className="text-xs text-stone-300">
                                {table.capacity - occupancy} lugar(es) disponível(eis)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unassigned Guests Panel */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden h-fit sticky top-6">
              <div className="px-4 py-3 border-b border-stone-100 bg-rose-50">
                <h3 className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-500" /> Sem mesa atribuída
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">{unassignedGuests.length} convidados</p>
              </div>
              <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
                {unassignedGuests.length === 0 ? (
                  <div className="px-4 py-8 text-center text-stone-400 text-sm">
                    Todos os convidados têm mesa! 🎉
                  </div>
                ) : (
                  unassignedGuests.map((guest) => (
                    <div key={guest.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-stone-800 mb-2">{guest.name}</p>
                      {assigningGuest === guest.id ? (
                        <div className="flex gap-1.5">
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) assignGuestToTable(guest.id, e.target.value);
                            }}
                            className="flex-1 text-xs px-2 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                          >
                            <option value="">Selecionar mesa...</option>
                            {tables
                              .filter((t) => t.guests.length < t.capacity)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.guests.length}/{t.capacity})
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => setAssigningGuest(null)}
                            className="px-2 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-500 hover:bg-stone-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningGuest(guest.id)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium hover:bg-rose-50 transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" /> Atribuir mesa
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showTableForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Nova Mesa</h2>
              <button onClick={() => setShowTableForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={addTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome da mesa *</label>
                <input
                  required
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  placeholder="Ex: Mesa dos Noivos, Mesa 1..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Formato</label>
                  <div className="flex gap-2">
                    {[
                      { value: "round", label: "⭕ Redonda" },
                      { value: "rectangular", label: "⬜ Retangular" },
                    ].map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setTableForm({ ...tableForm, shape: s.value })}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${tableForm.shape === s.value ? "border-rose-500 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-500"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Capacidade</label>
                  <input
                    type="number"
                    min="1"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Observações</label>
                <input
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
                  placeholder="Ex: Próximo à pista de dança..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTableForm(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-50">
                  {saving ? "Criando..." : "Criar Mesa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
