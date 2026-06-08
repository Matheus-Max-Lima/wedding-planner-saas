"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Trash2, Heart, ExternalLink } from "lucide-react";

interface InspirationItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string | null;
  description: string | null;
  tags: string[];
  favorite: boolean;
}

const CATEGORIES = ["Decoração", "Vestido", "Flores", "Bolos", "Convites", "Fotos", "Local", "Outros"];
const PLACEHOLDER_COLORS = ["bg-rose-100", "bg-pink-100", "bg-purple-100", "bg-blue-100", "bg-amber-100", "bg-emerald-100"];
const emptyForm = { title: "", category: "Decoração", imageUrl: "", description: "", tags: "", favorite: false };

export default function InspirationPage() {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("Todos");
  const [showFavs, setShowFavs] = useState(false);

  async function load() {
    const data = await fetch("/api/inspiration").then(r => r.json());
    setItems(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.title.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    try {
      const tags = form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
      await fetch("/api/inspiration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tags }) });
      toast.success("Inspiração adicionada!");
      await load();
      setForm(emptyForm);
      setShowModal(false);
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function toggleFav(item: InspirationItem) {
    await fetch(`/api/inspiration/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorite: !item.favorite }) });
    await load();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/inspiration/${id}`, { method: "DELETE" });
    toast.success("Inspiração removida");
    await load();
  }

  const filtered = items
    .filter(i => filterCat === "Todos" || i.category === filterCat)
    .filter(i => !showFavs || i.favorite);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-rose-500" /> Inspirações</h1>
          <p className="text-stone-500 text-sm mt-1">{items.length} inspirações salvas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {["Todos", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"}`}>{cat}</button>
        ))}
        <button onClick={() => setShowFavs(p => !p)} className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${showFavs ? "bg-rose-500 text-white border-rose-500" : "bg-white text-stone-600 border-stone-200"}`}>
          <Heart className="w-3 h-3" /> Favoritos
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Nenhuma inspiração encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-all bg-white">
              <div className={`h-40 ${PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length]} flex items-center justify-center relative`}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <ImageIcon className="w-10 h-10 text-stone-300" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {item.imageUrl && <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-stone-600 hover:text-blue-500"><ExternalLink className="w-4 h-4" /></a>}
                  <button onClick={() => deleteItem(item.id)} className="p-2 bg-white rounded-full text-stone-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <button onClick={() => toggleFav(item)} className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                  <Heart className={`w-3.5 h-3.5 ${item.favorite ? "text-rose-500 fill-rose-500" : "text-stone-400"}`} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-stone-800 truncate">{item.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">{item.category}</p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Nova inspiração</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">URL da imagem</label>
                <input type="url" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="https://..." value={form.imageUrl} onChange={e => setForm((p: any) => ({ ...p, imageUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tags (separadas por vírgula)</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="romântico, dourado, flores" value={form.tags} onChange={e => setForm((p: any) => ({ ...p, tags: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.favorite} onChange={e => setForm((p: any) => ({ ...p, favorite: e.target.checked }))} className="rounded" />
                <span className="text-sm text-stone-700">Marcar como favorito</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Salvando..." : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
