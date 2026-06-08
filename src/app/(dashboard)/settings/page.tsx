"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Heart,
  DollarSign,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Camera,
} from "lucide-react";

interface SettingsData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  wedding: {
    id: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    venue: string | null;
    city: string | null;
    totalBudget: number;
    theme: string | null;
    style: string | null;
  } | null;
}

interface FormState {
  // Profile
  name: string;
  profileImage: string;
  // Wedding info
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  city: string;
  theme: string;
  style: string;
  // Budget
  totalBudget: string;
}

const WEDDING_STYLES = [
  "Elegante",
  "Rústico",
  "Boho",
  "Moderno",
  "Clássico",
  "Romântico",
  "Tropical",
  "Minimalista",
];

const WEDDING_THEMES = [
  "Romântico Clássico",
  "Jardim Botânico",
  "Rústico Chic",
  "Praia",
  "Minimalista",
  "Hollywood Glamour",
  "Provençal",
  "Tropical",
  "Vintage",
  "Contemporâneo",
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    profileImage: "",
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
    city: "",
    theme: "",
    style: "",
    totalBudget: "",
  });

  const [originalEmail, setOriginalEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Falha ao carregar configurações");
      const data: SettingsData = await res.json();

      setOriginalEmail(data.user.email);

      setForm({
        name: data.user.name || "",
        profileImage: data.user.image || "",
        brideName: data.wedding?.brideName || "",
        groomName: data.wedding?.groomName || "",
        weddingDate: data.wedding?.weddingDate
          ? new Date(data.wedding.weddingDate).toISOString().split("T")[0]
          : "",
        venue: data.wedding?.venue || "",
        city: data.wedding?.city || "",
        theme: data.wedding?.theme || "",
        style: data.wedding?.style || "",
        totalBudget: data.wedding?.totalBudget?.toString() || "",
      });
    } catch (err) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          image: form.profileImage,
          brideName: form.brideName,
          groomName: form.groomName,
          weddingDate: form.weddingDate,
          venue: form.venue,
          city: form.city,
          theme: form.theme,
          style: form.style,
          totalBudget: parseFloat(form.totalBudget) || 0,
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar");

      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETAR") {
      toast.error('Digite "DELETAR" para confirmar');
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch("/api/settings", { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao deletar conta");
      toast.success("Conta deletada. Redirecionando...");
      router.push("/");
    } catch (err) {
      toast.error("Erro ao deletar conta");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">
          Gerencie as informações do seu casamento e perfil.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Profile Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Perfil</h2>
          </div>

          {/* Profile picture preview */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-full object-cover border-2 border-pink-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-pink-500" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-1">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da foto de perfil
              </label>
              <input
                type="url"
                name="profileImage"
                value={form.profileImage}
                onChange={handleChange}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email{" "}
                <span className="text-gray-400 font-normal">(somente leitura)</span>
              </label>
              <input
                type="email"
                value={originalEmail}
                readOnly
                className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Wedding Info Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-xl">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Informações do Casamento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Noiva
              </label>
              <input
                type="text"
                name="brideName"
                value={form.brideName}
                onChange={handleChange}
                placeholder="Nome da noiva"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Noivo
              </label>
              <input
                type="text"
                name="groomName"
                value={form.groomName}
                onChange={handleChange}
                placeholder="Nome do noivo"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Casamento
              </label>
              <input
                type="date"
                name="weddingDate"
                value={form.weddingDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="São Paulo, SP"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local da Cerimônia / Recepção
              </label>
              <input
                type="text"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Nome do espaço ou local"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <select
                name="theme"
                value={form.theme}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="">Selecione um tema</option>
                {WEDDING_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estilo
              </label>
              <select
                name="style"
                value={form.style}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="">Selecione um estilo</option>
                {WEDDING_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Budget Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Orçamento</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orçamento Total (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                R$
              </span>
              <input
                type="number"
                name="totalBudget"
                value={form.totalBudget}
                onChange={handleChange}
                min={0}
                step={100}
                placeholder="80000"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Este valor será usado para calcular percentuais e acompanhar os
              gastos.
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <section className="bg-white rounded-2xl border-2 border-red-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-red-700">Zona de Perigo</h2>
        </div>

        <p className="text-sm text-gray-600">
          Ao deletar sua conta, todos os dados do seu casamento — convidados,
          orçamento, checklist e fornecedores — serão permanentemente removidos.
          Esta ação não pode ser desfeita.
        </p>

        {!deleteConfirm ? (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 border-2 border-red-300 text-red-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Deletar minha conta
          </button>
        ) : (
          <div className="space-y-3 bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-sm font-medium text-red-700">
              Para confirmar, digite{" "}
              <span className="font-mono font-bold">DELETAR</span> abaixo:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETAR"
              className="w-full border border-red-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteInput !== "DELETAR"}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirmar exclusão
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteInput("");
                }}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
