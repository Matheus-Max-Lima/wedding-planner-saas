"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Plus, Search, X, Tag, Filter, Share2, Copy, Check } from "lucide-react";

const CATEGORIES = [
  "Todos",
  "Vestido",
  "Decoração",
  "Buquê",
  "Convites",
  "Bolo",
  "Penteado",
  "Maquiagem",
  "Local",
  "Lua de Mel",
  "Outros",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  Vestido: "👗",
  Decoração: "🌸",
  Buquê: "💐",
  Convites: "✉️",
  Bolo: "🎂",
  Penteado: "💆",
  Maquiagem: "💄",
  Local: "🏛️",
  "Lua de Mel": "🌙",
  Outros: "✨",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Vestido: "from-rose-200 to-pink-300",
  Decoração: "from-emerald-200 to-teal-300",
  Buquê: "from-purple-200 to-violet-300",
  Convites: "from-amber-200 to-yellow-300",
  Bolo: "from-orange-200 to-red-200",
  Penteado: "from-sky-200 to-blue-300",
  Maquiagem: "from-fuchsia-200 to-pink-300",
  Local: "from-stone-200 to-gray-300",
  "Lua de Mel": "from-indigo-200 to-blue-300",
  Outros: "from-rose-100 to-stone-200",
};

// 8 placeholder colors/gradients
const PLACEHOLDER_OPTIONS = [
  { label: "Rosa", value: "#f43f5e", style: { background: "#f43f5e" } },
  { label: "Dourado", value: "#d4af37", style: { background: "#d4af37" } },
  { label: "Lavanda", value: "#a78bfa", style: { background: "#a78bfa" } },
  { label: "Pêssego", value: "#fb923c", style: { background: "#fb923c" } },
  { label: "Menta", value: "#34d399", style: { background: "#34d399" } },
  { label: "Azul", value: "#60a5fa", style: { background: "#60a5fa" } },
  {
    label: "Gradiente Rosa",
    value: "gradient-rose",
    style: { background: "linear-gradient(135deg, #f43f5e, #fb923c)" },
  },
  {
    label: "Gradiente Dourado",
    value: "gradient-gold",
    style: { background: "linear-gradient(135deg, #d4af37, #f43f5e)" },
  },
];

function placeholderToDataUrl(value: string): string {
  // For solid colors return a 1x1 data URL; for gradients use canvas
  if (value.startsWith("gradient-")) {
    // We'll represent gradients as a special prefix so rendering can use a div instead
    return `__gradient__${value}`;
  }
  // Create 1x1 pixel data URL for solid color
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
  }
  return canvas.toDataURL();
}

function isPlaceholderUrl(url: string): boolean {
  return url.startsWith("data:") || url.startsWith("__gradient__");
}

function getPlaceholderStyle(url: string): React.CSSProperties {
  if (url.startsWith("__gradient__gradient-rose")) {
    return { background: "linear-gradient(135deg, #f43f5e, #fb923c)" };
  }
  if (url.startsWith("__gradient__gradient-gold")) {
    return { background: "linear-gradient(135deg, #d4af37, #f43f5e)" };
  }
  if (url.startsWith("data:")) {
    // Extract color from 1x1 data URL by creating image — simpler: store hex directly
    return { background: "#f43f5e" };
  }
  return {};
}

interface InspirationItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  tags: string[];
  notes?: string;
  favorite: boolean;
  sourceUrl?: string;
}

// Aspect ratio variants for moodboard
function getAspectRatio(index: number): string {
  const variants = ["1 / 1", "4 / 3", "3 / 4", "4 / 3", "1 / 1", "3 / 4"];
  return variants[index % variants.length];
}

export default function InspirationPage() {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    category: "Vestido",
    tags: "",
    notes: "",
    sourceUrl: "",
  });
  const [saving, setSaving] = useState(false);
  // View mode: "grid" | "moodboard"
  const [viewMode, setViewMode] = useState<"grid" | "moodboard">("grid");
  // Show only favorites
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  // Tag search input
  const [tagSearch, setTagSearch] = useState("");
  // Copied state for share button
  const [copied, setCopied] = useState(false);
  // Image input mode: "url" | "placeholder"
  const [imageInputMode, setImageInputMode] = useState<"url" | "placeholder">("url");
  const [urlInputValue, setUrlInputValue] = useState("");
  const [urlPreview, setUrlPreview] = useState("");
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);
  const [urlValid, setUrlValid] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/inspiration");
      if (res.ok) setItems(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Debounced URL preview
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!urlInputValue) {
      setUrlPreview("");
      setUrlValid(true);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const valid = urlInputValue.startsWith("http");
      setUrlValid(valid);
      setUrlPreview(valid ? urlInputValue : "");
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [urlInputValue]);

  // Sync imageUrl to form based on mode
  useEffect(() => {
    if (imageInputMode === "url") {
      setForm((f) => ({ ...f, imageUrl: urlValid && urlInputValue.startsWith("http") ? urlInputValue : "" }));
    } else if (imageInputMode === "placeholder" && selectedPlaceholder) {
      // Store placeholder identifier as imageUrl — rendered as div
      const dataUrl = placeholderToDataUrl(selectedPlaceholder);
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    } else if (imageInputMode === "placeholder" && !selectedPlaceholder) {
      setForm((f) => ({ ...f, imageUrl: "" }));
    }
  }, [imageInputMode, urlInputValue, urlValid, selectedPlaceholder]);

  const toggleFavorite = async (item: InspirationItem) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, favorite: !i.favorite } : i))
    );
    await fetch(`/api/inspiration/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !item.favorite }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/inspiration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setForm({ title: "", imageUrl: "", category: "Vestido", tags: "", notes: "", sourceUrl: "" });
      setUrlInputValue("");
      setUrlPreview("");
      setSelectedPlaceholder(null);
      setImageInputMode("url");
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleShareMoodboard = async () => {
    const brideName = "Noiva";
    const groomName = "Noivo";
    const list = filtered
      .map((item) => `• ${item.title}${item.sourceUrl ? ` — ${item.sourceUrl}` : ""}`)
      .join("\n");
    const text = `✨ Inspirações de ${brideName} & ${groomName}\n\n${list}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "Todos" || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    const matchFav = !onlyFavorites || item.favorite;
    const tq = tagSearch.toLowerCase().trim();
    const matchTag = !tq || item.tags.some((t) => t.toLowerCase().includes(tq));
    return matchCat && matchSearch && matchFav && matchTag;
  });

  function renderItemImage(item: InspirationItem, index: number, moodboard = false) {
    const ar = moodboard ? getAspectRatio(index) : undefined;
    if (item.imageUrl && !isPlaceholderUrl(item.imageUrl)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full object-cover"
          style={ar ? { aspectRatio: ar } : { minHeight: 160 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const sib = (e.target as HTMLImageElement).nextElementSibling as HTMLElement | null;
            if (sib) sib.classList.remove("hidden");
          }}
        />
      );
    }
    const placeholderStyle: React.CSSProperties =
      item.imageUrl && isPlaceholderUrl(item.imageUrl)
        ? item.imageUrl.startsWith("__gradient__")
          ? getPlaceholderStyle(item.imageUrl)
          : {}
        : {};

    const grad = `bg-gradient-to-br ${CATEGORY_GRADIENTS[item.category] || "from-rose-200 to-pink-300"}`;
    return (
      <div
        className={`${item.imageUrl && isPlaceholderUrl(item.imageUrl) ? "" : grad} flex items-center justify-center`}
        style={{
          ...(ar ? { aspectRatio: ar } : { height: 160 }),
          ...(item.imageUrl && isPlaceholderUrl(item.imageUrl) ? placeholderStyle : {}),
        }}
      >
        {!(item.imageUrl && isPlaceholderUrl(item.imageUrl)) && (
          <span className="text-5xl">{CATEGORY_EMOJIS[item.category] || "✨"}</span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <span>🌸</span> Inspirações
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Seu mural de inspirações para o casamento perfeito
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareMoodboard}
              className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 bg-white text-stone-600 rounded-xl font-medium hover:border-rose-300 hover:text-rose-600 transition-colors text-sm"
              title="Compartilhar Moodboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Copiado!" : "Compartilhar"}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 text-sm"
            >
              <Plus className="w-4 h-4" /> Adicionar inspiração
            </button>
          </div>
        </div>

        {/* View mode tabs + filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* View mode tabs */}
          <div className="flex bg-white border border-stone-200 rounded-xl p-1 gap-1 flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("moodboard")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "moodboard"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Moodboard
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou tag..."
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            />
          </div>

          {/* Tag search */}
          <div className="relative flex-shrink-0">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Filtrar por tag..."
              className="pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white w-44"
            />
          </div>

          {/* Only favorites toggle */}
          <button
            onClick={() => setOnlyFavorites((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors flex-shrink-0 ${
              onlyFavorites
                ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:border-rose-300"
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? "fill-white text-white" : ""}`} />
            Favoritos
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-rose-300"
              }`}
            >
              {cat !== "Todos" && CATEGORY_EMOJIS[cat] ? `${CATEGORY_EMOJIS[cat]} ` : ""}
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <p className="text-stone-500 font-medium">Nenhuma inspiração encontrada</p>
            <p className="text-stone-400 text-sm mt-1">
              Adicione suas primeiras inspirações!
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid layout
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="break-inside-avoid bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative">
                  {renderItemImage(item, idx)}
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item)}
                    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.favorite ? "text-rose-500 fill-rose-500" : "text-stone-400"
                      }`}
                    />
                  </button>
                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-stone-600">
                      {CATEGORY_EMOJIS[item.category]} {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-stone-800 text-sm leading-tight">{item.title}</h3>
                  {item.notes && (
                    <p className="text-stone-500 text-xs mt-1 line-clamp-2">{item.notes}</p>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Moodboard layout — CSS columns masonry
          <div style={{ columnCount: 3, columnGap: "1rem" }}>
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow group"
                style={{ breakInside: "avoid", marginBottom: "1rem" }}
              >
                <div className="relative">
                  {/* Image with variable aspect ratio for moodboard */}
                  {item.imageUrl && !isPlaceholderUrl(item.imageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full object-cover"
                      style={{ aspectRatio: getAspectRatio(idx) }}
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center ${
                        item.imageUrl && isPlaceholderUrl(item.imageUrl)
                          ? ""
                          : `bg-gradient-to-br ${CATEGORY_GRADIENTS[item.category] || "from-rose-200 to-pink-300"}`
                      }`}
                      style={{
                        aspectRatio: getAspectRatio(idx),
                        ...(item.imageUrl && isPlaceholderUrl(item.imageUrl)
                          ? getPlaceholderStyle(item.imageUrl)
                          : {}),
                      }}
                    >
                      {!(item.imageUrl && isPlaceholderUrl(item.imageUrl)) && (
                        <span className="text-4xl">{CATEGORY_EMOJIS[item.category] || "✨"}</span>
                      )}
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item)}
                    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.favorite ? "text-rose-500 fill-rose-500" : "text-stone-400"
                      }`}
                    />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-stone-800 text-sm leading-tight">{item.title}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{CATEGORY_EMOJIS[item.category]} {item.category}</p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {items.length > 0 && (
          <div className="flex gap-4 text-sm text-stone-500">
            <span>{items.length} inspirações</span>
            <span>·</span>
            <span>{items.filter((i) => i.favorite).length} favoritas</span>
            <span>·</span>
            <span>{filtered.length} exibidas</span>
          </div>
        )}
      </div>

      {/* Add Inspiration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Nova Inspiração</h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Vestido princesa com cauda..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              {/* Image input with tabs */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Imagem</label>
                {/* Tabs */}
                <div className="flex bg-stone-100 rounded-xl p-1 gap-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      imageInputMode === "url"
                        ? "bg-white text-stone-800 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    URL da imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("placeholder")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      imageInputMode === "placeholder"
                        ? "bg-white text-stone-800 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Usar placeholder
                  </button>
                </div>

                {imageInputMode === "url" ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        value={urlInputValue}
                        onChange={(e) => setUrlInputValue(e.target.value)}
                        placeholder="https://..."
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                          urlInputValue && !urlValid
                            ? "border-red-300 bg-red-50"
                            : "border-stone-200"
                        }`}
                      />
                      {urlInputValue && !urlValid && (
                        <p className="text-xs text-red-500 mt-1">
                          URL deve começar com &quot;http&quot;
                        </p>
                      )}
                    </div>
                    {/* Live preview */}
                    {urlPreview && (
                      <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlPreview}
                          alt="Preview"
                          className="w-full object-cover"
                          style={{ maxHeight: 160 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <p className="text-xs text-stone-400 text-center py-1">Pré-visualização</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {PLACEHOLDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedPlaceholder(opt.value)}
                        className={`w-full aspect-square rounded-xl transition-all ${
                          selectedPlaceholder === opt.value
                            ? "ring-2 ring-offset-2 ring-[#f43f5e] scale-105"
                            : "hover:scale-105"
                        }`}
                        style={opt.style}
                        title={opt.label}
                      />
                    ))}
                    {selectedPlaceholder && (
                      <p className="col-span-4 text-xs text-stone-500 text-center mt-1">
                        Cor selecionada — será exibida como capa colorida
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Categoria *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  {CATEGORIES.filter((c) => c !== "Todos").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  <Tag className="inline w-3.5 h-3.5 mr-1" />
                  Tags (separadas por vírgula)
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Ex: romântico, rendas, moderno"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Observações sobre essa inspiração..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">URL da Fonte</label>
                <input
                  value={form.sourceUrl}
                  onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                  placeholder="Pinterest, Instagram..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
