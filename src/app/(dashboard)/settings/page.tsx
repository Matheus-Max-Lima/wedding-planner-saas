"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings, User, Lock, Calendar, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SettingsData {
  user: { id: string; name: string; email: string };
  wedding: { brideName: string; groomName: string; weddingDate: string | null; venue: string | null; city: string | null; totalBudget: number; style: string | null; guestCount: number | null; };
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"wedding" | "profile" | "password">("wedding");
  const [weddingForm, setWeddingForm] = useState({ brideName: "", groomName: "", weddingDate: "", venue: "", city: "", totalBudget: "", style: "", guestCount: "" });
  const [profileForm, setProfileForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const d = await fetch("/api/settings").then(r => r.json());
    setData(d);
    if (d) {
      setWeddingForm({ brideName: d.wedding.brideName || "", groomName: d.wedding.groomName || "", weddingDate: d.wedding.weddingDate ? d.wedding.weddingDate.split("T")[0] : "", venue: d.wedding.venue || "", city: d.wedding.city || "", totalBudget: String(d.wedding.totalBudget || ""), style: d.wedding.style || "", guestCount: String(d.wedding.guestCount || "") });
      setProfileForm({ name: d.user.name || "" });
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveWedding() {
    setSaving(true);
    try {
      await fetch("/api/wedding", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(weddingForm) });
      toast.success("Informações do casamento salvas!"); await load();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "profile", ...profileForm }) });
      toast.success("Perfil atualizado!"); await load();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  }

  async function savePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return toast.error("Preencha todos os campos");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error("As senhas não coincidem");
    if (passwordForm.newPassword.length < 6) return toast.error("Senha deve ter pelo menos 6 caracteres");
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "password", currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) });
      const d = await res.json();
      if (!res.ok) return toast.error(d.error || "Erro ao alterar senha");
      toast.success("Senha alterada com sucesso!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch { toast.error("Erro ao alterar senha"); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  const STYLES = ["Clássico", "Rústico", "Moderno", "Boho", "Minimalista", "Romântico", "Tropical", "Glamour"];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><Settings className="w-6 h-6 text-rose-500" /> Configurações</h1>
        <p className="text-stone-500 text-sm mt-1">Gerencie as informações do seu casamento e conta</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: "wedding", label: "Casamento", icon: Heart },
          { id: "profile", label: "Perfil", icon: User },
          { id: "password", label: "Senha", icon: Lock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "wedding" && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-800 mb-5 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> Informações do casamento</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Nome da noiva</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.brideName} onChange={e => setWeddingForm(p => ({ ...p, brideName: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Nome do noivo</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.groomName} onChange={e => setWeddingForm(p => ({ ...p, groomName: e.target.value }))} /></div>
            </div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Data do casamento</label><input type="date" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.weddingDate} onChange={e => setWeddingForm(p => ({ ...p, weddingDate: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Local/Salão</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.venue} onChange={e => setWeddingForm(p => ({ ...p, venue: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Cidade</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.city} onChange={e => setWeddingForm(p => ({ ...p, city: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Orçamento total (R$)</label><input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.totalBudget} onChange={e => setWeddingForm(p => ({ ...p, totalBudget: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Número de convidados</label><input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.guestCount} onChange={e => setWeddingForm(p => ({ ...p, guestCount: e.target.value }))} /></div>
            </div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Estilo do casamento</label><select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={weddingForm.style} onChange={e => setWeddingForm(p => ({ ...p, style: e.target.value }))}><option value="">Selecionar estilo</option>{STYLES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <button onClick={saveWedding} disabled={saving} className="mt-6 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60 transition-all">{saving ? "Salvando..." : "Salvar alterações"}</button>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-800 mb-5 flex items-center gap-2"><User className="w-4 h-4 text-rose-400" /> Informações da conta</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Nome</label><input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Email</label><input disabled className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-400 cursor-not-allowed" value={data?.user.email || ""} /></div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="mt-6 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60 transition-all">{saving ? "Salvando..." : "Salvar alterações"}</button>
        </div>
      )}

      {activeTab === "password" && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-800 mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-rose-400" /> Alterar senha</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Senha atual</label><input type="password" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Nova senha</label><input type="password" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Confirmar nova senha</label><input type="password" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} /></div>
          </div>
          <button onClick={savePassword} disabled={saving} className="mt-6 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60 transition-all">{saving ? "Alterando..." : "Alterar senha"}</button>
        </div>
      )}
    </div>
  );
}
