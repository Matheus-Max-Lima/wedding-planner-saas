"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PartyPopper, Plus, Trash2, Edit2, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BacheloretteActivity { id: string; title: string; time: string | null; description: string | null; cost: number; }
interface BacheloretteGuest { id: string; name: string; confirmed: boolean; paid: boolean; amountPaid: number; }
interface Bachelorette { id: string; theme: string | null; date: string | null; location: string | null; budget: number; notes: string | null; activities: BacheloretteActivity[]; bacheloretteGuests: BacheloretteGuest[]; }

export default function BachelorettePage() {
  const [data, setData] = useState<Bachelorette | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editGuest, setEditGuest] = useState<BacheloretteGuest | null>(null);
  const [activeTab, setActiveTab] = useState<"activities" | "guests">("activities");
  const [infoForm, setInfoForm] = useState({ theme: "", date: "", location: "", budget: "", notes: "" });
  const [actForm, setActForm] = useState({ title: "", time: "", description: "", cost: "" });
  const [guestForm, setGuestForm] = useState({ name: "", confirmed: false, paid: false, amountPaid: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const d = await fetch("/api/bachelorette").then(r => r.json());
    setData(d);
    if (d) setInfoForm({ theme: d.theme || "", date: d.date ? d.date.split("T")[0] : "", location: d.location || "", budget: String(d.budget || ""), notes: d.notes || "" });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveInfo() {
    setSaving(true);
    try {
      await fetch("/api/bachelorette", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(infoForm) });
      toast.success("Informações salvas!"); await load(); setShowInfoModal(false);
    } catch { toast.error("Erro"); } finally { setSaving(false); }
  }

  async function addActivity() {
    if (!actForm.title.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    try {
      await fetch("/api/bachelorette/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(actForm) });
      toast.success("Atividade adicionada!"); await load(); setActForm({ title: "", time: "", description: "", cost: "" }); setShowActivityModal(false);
    } catch { toast.error("Erro"); } finally { setSaving(false); }
  }

  async function deleteActivity(id: string) {
    await fetch(`/api/bachelorette/activities/${id}`, { method: "DELETE" });
    toast.success("Atividade removida"); await load();
  }

  async function saveGuest() {
    if (!guestForm.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      if (editGuest) {
        await fetch(`/api/bachelorette/guests/${editGuest.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(guestForm) });
        toast.success("Convidada atualizada!");
      } else {
        await fetch("/api/bachelorette/guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(guestForm) });
        toast.success("Convidada adicionada!");
      }
      await load(); setGuestForm({ name: "", confirmed: false, paid: false, amountPaid: "" }); setEditGuest(null); setShowGuestModal(false);
    } catch { toast.error("Erro"); } finally { setSaving(false); }
  }

  async function deleteGuest(id: string) {
    await fetch(`/api/bachelorette/guests/${id}`, { method: "DELETE" });
    toast.success("Convidada removida"); await load();
  }

  function openEditGuest(g: BacheloretteGuest) {
    setEditGuest(g);
    setGuestForm({ name: g.name, confirmed: g.confirmed, paid: g.paid, amountPaid: String(g.amountPaid || "") });
    setShowGuestModal(true);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  const totalCollected = data?.bacheloretteGuests.reduce((s, g) => s + g.amountPaid, 0) || 0;
  const confirmedGuests = data?.bacheloretteGuests.filter(g => g.confirmed).length || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><PartyPopper className="w-6 h-6 text-rose-500" /> Despedida de Solteira</h1>
          <p className="text-stone-500 text-sm mt-1">Organize a festa antes do grande dia</p>
        </div>
        <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Edit2 className="w-4 h-4" /> {data ? "Editar info" : "Configurar"}
        </button>
      </div>

      {data && (
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}>
          <PartyPopper className="absolute right-4 top-4 w-16 h-16 opacity-10" />
          <div className="relative">
            {data.theme && <p className="text-pink-200 text-xs uppercase tracking-wider mb-1">Tema: {data.theme}</p>}
            {data.date && <p className="text-xl font-bold">{new Date(data.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>}
            {data.location && <p className="text-pink-100 mt-1">{data.location}</p>}
            <div className="flex gap-6 mt-3 text-sm">
              <span className="flex items-center gap-1.5 text-pink-100"><Users className="w-4 h-4" />{confirmedGuests} confirmadas</span>
              {data.budget > 0 && <span className="flex items-center gap-1.5 text-pink-100"><DollarSign className="w-4 h-4" />Orçamento: {formatCurrency(data.budget)}</span>}
              {totalCollected > 0 && <span className="flex items-center gap-1.5 text-pink-100">Coletado: {formatCurrency(totalCollected)}</span>}
            </div>
          </div>
        </div>
      )}

      {!data && (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <PartyPopper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-400 mb-4">Configure os detalhes da despedida de solteira</p>
          <button onClick={() => setShowInfoModal(true)} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">Começar planejamento</button>
        </div>
      )}

      {data && (
        <>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab("activities")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "activities" ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"}`}>Atividades</button>
            <button onClick={() => setActiveTab("guests")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "guests" ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"}`}>Convidadas ({data.bacheloretteGuests.length})</button>
          </div>

          {activeTab === "activities" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-stone-700">Atividades</h2>
                <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"><Plus className="w-4 h-4" /> Adicionar</button>
              </div>
              {data.activities.length === 0 ? <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center"><p className="text-stone-400">Nenhuma atividade planejada</p></div> : (
                <div className="space-y-2">
                  {data.activities.map(a => (
                    <div key={a.id} className="flex items-center gap-3 bg-white rounded-xl border border-stone-100 px-4 py-3 group hover:border-rose-200">
                      <div className="flex-1">
                        <p className="font-medium text-stone-700 text-sm">{a.title}</p>
                        {a.time && <p className="text-xs text-stone-400">{a.time}</p>}
                        {a.description && <p className="text-xs text-stone-400">{a.description}</p>}
                      </div>
                      {a.cost > 0 && <span className="text-sm font-semibold text-stone-700">{formatCurrency(a.cost)}</span>}
                      <button onClick={() => deleteActivity(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "guests" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-stone-700">Convidadas</h2>
                <button onClick={() => setShowGuestModal(true)} className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"><Plus className="w-4 h-4" /> Adicionar</button>
              </div>
              {data.bacheloretteGuests.length === 0 ? <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center"><p className="text-stone-400">Nenhuma convidada adicionada</p></div> : (
                <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-50">
                  {data.bacheloretteGuests.map(g => (
                    <div key={g.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-700">{g.name}</p>
                        <div className="flex gap-2 mt-0.5">
                          {g.confirmed && <span className="text-xs text-emerald-600">Confirmada</span>}
                          {g.paid && <span className="text-xs text-blue-600">Pagou {formatCurrency(g.amountPaid)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEditGuest(g)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteGuest(g.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInfoModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Informações da despedida</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Tema</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Ex: Anos 80, Branco..." value={infoForm.theme} onChange={e => setInfoForm(p => ({ ...p, theme: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Data</label><input type="date" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={infoForm.date} onChange={e => setInfoForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Local</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={infoForm.location} onChange={e => setInfoForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Orçamento</label><input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={infoForm.budget} onChange={e => setInfoForm(p => ({ ...p, budget: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInfoModal(false)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={saveInfo} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowActivityModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Nova atividade</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Título *</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={actForm.title} onChange={e => setActForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Horário</label><input type="time" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={actForm.time} onChange={e => setActForm(p => ({ ...p, time: e.target.value }))} /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Custo</label><input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={actForm.cost} onChange={e => setActForm(p => ({ ...p, cost: e.target.value }))} /></div>
              </div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label><textarea rows={2} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" value={actForm.description} onChange={e => setActForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowActivityModal(false)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={addActivity} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Adicionando..." : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}

      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowGuestModal(false); setEditGuest(null); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{editGuest ? "Editar convidada" : "Nova convidada"}</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={guestForm.name} onChange={e => setGuestForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Valor pago</label><input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={guestForm.amountPaid} onChange={e => setGuestForm(p => ({ ...p, amountPaid: e.target.value }))} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={guestForm.confirmed} onChange={e => setGuestForm(p => ({ ...p, confirmed: e.target.checked }))} className="rounded" /><span className="text-sm text-stone-700">Confirmada</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={guestForm.paid} onChange={e => setGuestForm(p => ({ ...p, paid: e.target.checked }))} className="rounded" /><span className="text-sm text-stone-700">Pagou</span></label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowGuestModal(false); setEditGuest(null); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={saveGuest} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : editGuest ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
