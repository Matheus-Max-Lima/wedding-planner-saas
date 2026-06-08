"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Plus, Search, Trash2, Edit2, UserCheck, UserX, Clock } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  group: string | null;
  plusOne: boolean;
  plusOneName: string | null;
  notes: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700", icon: UserCheck },
  DECLINED: { label: "Recusou", color: "bg-red-100 text-red-700", icon: UserX },
};

const GROUPS = ["Família da Noiva", "Família do Noivo", "Amigos da Noiva", "Amigos do Noivo", "Amigos do Casal", "Trabalho", "Outros"];
const emptyForm = { name: "", email: "", phone: "", status: "PENDING", group: "", plusOne: false, plusOneName: "", notes: "" };

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/guests").then(r => r.json());
    setGuests(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      if (editGuest) {
        await fetch(`/api/guests/${editGuest.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Convidado atualizado!");
      } else {
        await fetch("/api/guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Convidado adicionado!");
      }
      await load();
      closeModal();
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function deleteGuest(id: string) {
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    toast.success("Convidado removido");
    await load();
  }

  async function updateStatus(guest: Guest, status: string) {
    await fetch(`/api/guests/${guest.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  function openEdit(guest: Guest) {
    setEditGuest(guest);
    setForm({ name: guest.name, email: guest.email || "", phone: guest.phone || "", status: guest.status, group: guest.group || "", plusOne: guest.plusOne, plusOneName: guest.plusOneName || "", notes: guest.notes || "" });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditGuest(null);
    setForm(emptyForm);
  }

  const filtered = guests.filter(g =>
    (filterStatus === "ALL" || g.status === filterStatus) &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || (g.email || "").toLowerCase().includes(search.toLowerCase()))
  );

  const confirmed = guests.filter(g => g.status === "CONFIRMED").length;
  const pending = guests.filter(g => g.status === "PENDING").length;
  const declined = guests.filter(g => g.status === "DECLINED").length;
  const total = guests.reduce((s, g) => s + 1 + (g.plusOne ? 1 : 0), 0);

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
            <Users className="w-6 h-6 text-rose-500" /> Convidados
          </h1>
          <p className="text-stone-500 text-sm mt-1">{guests.length} convidados · {total} pessoas (com acompanhantes)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Confirmados", count: confirmed, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pendentes", count: pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Recusaram", count: declined, color: "text-red-600", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="Buscar convidado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {["ALL", "PENDING", "CONFIRMED", "DECLINED"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filterStatus === s ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"
            }`}
          >
            {s === "ALL" ? "Todos" : STATUS_LABELS[s].label}
          </button>
        ))}
      </div>

      {/* Guest list */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">Nenhum convidado encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map(guest => {
              const status = STATUS_LABELS[guest.status];
              return (
                <div key={guest.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-rose-600 font-semibold text-sm">{guest.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700">
                      {guest.name}
                      {guest.plusOne && <span className="ml-1 text-xs text-stone-400">+1 {guest.plusOneName ? `(${guest.plusOneName})` : ""}</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {guest.group && <span className="text-xs text-stone-400">{guest.group}</span>}
                      {guest.email && <span className="text-xs text-stone-400">{guest.email}</span>}
                    </div>
                  </div>
                  <select
                    value={guest.status}
                    onChange={e => updateStatus(guest, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${status.color}`}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="DECLINED">Recusou</option>
                  </select>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(guest)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteGuest(guest.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editGuest ? "Editar convidado" : "Novo convidado"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
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
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Grupo</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.group} onChange={e => setForm((p: any) => ({ ...p, group: e.target.value }))}>
                  <option value="">Sem grupo</option>
                  {GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                  <option value="PENDING">Pendente</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="DECLINED">Recusou</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.plusOne} onChange={e => setForm((p: any) => ({ ...p, plusOne: e.target.checked }))} className="rounded" />
                <span className="text-sm text-stone-700">Vem com acompanhante</span>
              </label>
              {form.plusOne && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nome do acompanhante</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.plusOneName} onChange={e => setForm((p: any) => ({ ...p, plusOneName: e.target.value }))} />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">
                {saving ? "Salvando..." : editGuest ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
