"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plane, Plus, Trash2, Edit2, MapPin, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  date: string | null;
  time: string | null;
  description: string | null;
  cost: number;
  booked: boolean;
  confirmationCode: string | null;
}

interface Honeymoon {
  id: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  budget: number;
  totalSpent: number;
  notes: string | null;
  activities: Activity[];
}

export default function HoneymoonPage() {
  const [honeymoon, setHoneymoon] = useState<Honeymoon | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHoneymoonModal, setShowHoneymoonModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [hForm, setHForm] = useState({ destination: "", startDate: "", endDate: "", budget: "", notes: "" });
  const [aForm, setAForm] = useState({ title: "", date: "", time: "", description: "", cost: "", booked: false, confirmationCode: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/honeymoon").then(r => r.json());
    setHoneymoon(data);
    if (data) {
      setHForm({ destination: data.destination || "", startDate: data.startDate ? data.startDate.split("T")[0] : "", endDate: data.endDate ? data.endDate.split("T")[0] : "", budget: String(data.budget || ""), notes: data.notes || "" });
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveHoneymoon() {
    if (!hForm.destination.trim()) return toast.error("Destino obrigatório");
    setSaving(true);
    try {
      await fetch("/api/honeymoon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hForm) });
      toast.success("Lua de mel atualizada!");
      await load();
      setShowHoneymoonModal(false);
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function saveActivity() {
    if (!aForm.title.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    try {
      if (editActivity) {
        await fetch(`/api/honeymoon/activities/${editActivity.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(aForm) });
        toast.success("Atividade atualizada!");
      } else {
        await fetch("/api/honeymoon/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(aForm) });
        toast.success("Atividade adicionada!");
      }
      await load();
      closeActivityModal();
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function deleteActivity(id: string) {
    await fetch(`/api/honeymoon/activities/${id}`, { method: "DELETE" });
    toast.success("Atividade removida");
    await load();
  }

  function openEditActivity(a: Activity) {
    setEditActivity(a);
    setAForm({ title: a.title, date: a.date ? a.date.split("T")[0] : "", time: a.time || "", description: a.description || "", cost: String(a.cost), booked: a.booked, confirmationCode: a.confirmationCode || "" });
    setShowActivityModal(true);
  }

  function closeActivityModal() {
    setShowActivityModal(false);
    setEditActivity(null);
    setAForm({ title: "", date: "", time: "", description: "", cost: "", booked: false, confirmationCode: "" });
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  const totalActivitiesCost = honeymoon?.activities.reduce((s, a) => s + a.cost, 0) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><Plane className="w-6 h-6 text-rose-500" /> Lua de Mel</h1>
          <p className="text-stone-500 text-sm mt-1">Planeje a viagem dos sonhos</p>
        </div>
        <button onClick={() => setShowHoneymoonModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Edit2 className="w-4 h-4" /> {honeymoon ? "Editar destino" : "Configurar destino"}
        </button>
      </div>

      {!honeymoon ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Plane className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">Planeje sua lua de mel</h3>
          <p className="text-stone-400 text-sm mb-6">Adicione o destino e planeje todas as atividades da viagem</p>
          <button onClick={() => setShowHoneymoonModal(true)} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">Começar planejamento</button>
        </div>
      ) : (
        <>
          {/* Destination card */}
          <div className="rounded-2xl text-white p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <div className="absolute right-0 top-0 opacity-10">
              <Plane className="w-32 h-32" style={{ transform: "translate(10px, -10px) rotate(45deg)" }} />
            </div>
            <div className="relative">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Destino</p>
              <h2 className="text-3xl font-bold mt-1">{honeymoon.destination}</h2>
              <div className="flex flex-wrap gap-4 mt-4 text-indigo-100 text-sm">
                {honeymoon.startDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(honeymoon.startDate)}
                    {honeymoon.endDate && ` → ${formatDate(honeymoon.endDate)}`}
                  </span>
                )}
                {honeymoon.budget > 0 && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    Orçamento: {formatCurrency(honeymoon.budget)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Budget progress */}
          {honeymoon.budget > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">Orçamento utilizado</span>
                <span className="text-sm font-bold text-indigo-600">{formatCurrency(totalActivitiesCost)} / {formatCurrency(honeymoon.budget)}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (totalActivitiesCost / honeymoon.budget) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Activities */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-800">Atividades e reservas</h2>
            <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600 font-medium">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>

          {honeymoon.activities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
              <p className="text-stone-400">Nenhuma atividade ainda. Adicione hotéis, passeios, restaurantes...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {honeymoon.activities.map(activity => (
                <div key={activity.id} className="bg-white rounded-2xl border border-stone-100 p-4 hover:border-indigo-200 group transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-stone-800">{activity.title}</h3>
                        {activity.booked && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reservado
                          </span>
                        )}
                      </div>
                      {activity.description && <p className="text-sm text-stone-500 mt-0.5">{activity.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-400">
                        {activity.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(activity.date).toLocaleDateString("pt-BR")}</span>}
                        {activity.time && <span>{activity.time}</span>}
                        {activity.confirmationCode && <span className="font-mono bg-stone-100 px-2 py-0.5 rounded">#{activity.confirmationCode}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-stone-700">{formatCurrency(activity.cost)}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEditActivity(activity)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteActivity(activity.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Honeymoon modal */}
      {showHoneymoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHoneymoonModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Destino da lua de mel</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Destino *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Ex: Paris, França" value={hForm.destination} onChange={e => setHForm(p => ({ ...p, destination: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Data de ida</label>
                  <input type="date" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={hForm.startDate} onChange={e => setHForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Data de volta</label>
                  <input type="date" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={hForm.endDate} onChange={e => setHForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Orçamento</label>
                <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={hForm.budget} onChange={e => setHForm(p => ({ ...p, budget: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
                <textarea rows={2} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" value={hForm.notes} onChange={e => setHForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowHoneymoonModal(false)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={saveHoneymoon} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeActivityModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editActivity ? "Editar atividade" : "Nova atividade"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Ex: Hotel, Tour, Restaurante..." value={aForm.title} onChange={e => setAForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Data</label>
                  <input type="date" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={aForm.date} onChange={e => setAForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Horário</label>
                  <input type="time" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={aForm.time} onChange={e => setAForm(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Custo (R$)</label>
                <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={aForm.cost} onChange={e => setAForm(p => ({ ...p, cost: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Código de confirmação</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={aForm.confirmationCode} onChange={e => setAForm(p => ({ ...p, confirmationCode: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
                <textarea rows={2} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" value={aForm.description} onChange={e => setAForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={aForm.booked} onChange={e => setAForm(p => ({ ...p, booked: e.target.checked }))} className="rounded" />
                <span className="text-sm text-stone-700">Já reservado</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeActivityModal} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={saveActivity} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : editActivity ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
