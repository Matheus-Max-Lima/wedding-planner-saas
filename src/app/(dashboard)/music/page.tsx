"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Music,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Download,
  Search,
  Clock,
  ListMusic,
  ExternalLink,
} from "lucide-react";

const PLAYLIST_SECTIONS = [
  { moment: "ceremony", label: "Cerimônia", emoji: "💍", color: "rose" },
  { moment: "cocktail", label: "Cocktail", emoji: "🥂", color: "amber" },
  { moment: "reception", label: "Jantar / Recepção", emoji: "🍽️", color: "emerald" },
  { moment: "party", label: "Festa", emoji: "🎉", color: "purple" },
];

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-50 border-rose-200 text-rose-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

const BADGE_MAP: Record<string, string> = {
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  purple: "bg-purple-100 text-purple-600",
};

interface SpotifyPlaylist {
  id: string;
  name: string;
  totalTracks: number;
  imageUrl: string | null;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  order: number;
  playlistId: string;
}

interface Playlist {
  id: string;
  moment: string;
  name: string;
  tracks: Track[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function totalDuration(tracks: Track[]): number {
  return tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
}

function formatTotalDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function MusicPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [trackForm, setTrackForm] = useState({ title: "", artist: "", duration: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Spotify state
  const [spotifyConnected, setSpotifyConnected] = useState<boolean | null>(null);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loadingSpotify, setLoadingSpotify] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importTarget, setImportTarget] = useState<string>("");

  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await fetch("/api/music/playlists");
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      }
    } catch {}
    setLoading(false);
  }, []);

  const fetchSpotifyStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        const data = await res.json();
        setSpotifyConnected(data.spotify);
      }
    } catch {}
  }, []);

  const fetchSpotifyPlaylists = useCallback(async () => {
    setLoadingSpotify(true);
    try {
      const res = await fetch("/api/integrations/spotify/playlists");
      if (res.ok) {
        const data = await res.json();
        setSpotifyPlaylists(data);
        setShowSpotify(true);
      }
    } catch {}
    setLoadingSpotify(false);
  }, []);

  const importSpotifyPlaylist = async (spotifyPlaylistId: string, localPlaylistId: string) => {
    setImportingId(spotifyPlaylistId);
    try {
      const res = await fetch("/api/integrations/spotify/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyPlaylistId, localPlaylistId }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.imported} músicas importadas com sucesso!`);
        fetchPlaylists();
      }
    } catch {}
    setImportingId(null);
    setImportTarget("");
  };

  useEffect(() => { fetchPlaylists(); fetchSpotifyStatus(); }, [fetchPlaylists, fetchSpotifyStatus]);

  // Handle URL param on redirect back from Spotify OAuth
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("spotify") === "connected") {
      setSpotifyConnected(true);
      window.history.replaceState({}, "", "/music");
    }
  }, []);

  // Ensure all sections have a playlist object
  const getPlaylist = (moment: string): Playlist | undefined =>
    playlists.find((p) => p.moment === moment);

  const ensurePlaylist = async (moment: string, label: string): Promise<Playlist> => {
    const existing = getPlaylist(moment);
    if (existing) return existing;
    const res = await fetch("/api/music/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moment, name: label }),
    });
    const pl = await res.json();
    setPlaylists((prev) => [...prev, pl]);
    return pl;
  };

  const addTrack = async (moment: string, label: string) => {
    if (!trackForm.title || !trackForm.artist) return;
    setSaving(true);
    const pl = await ensurePlaylist(moment, label);
    const durationSec = trackForm.duration
      ? parseInt(trackForm.duration.split(":")[0] || "0") * 60 +
        parseInt(trackForm.duration.split(":")[1] || "0")
      : undefined;
    const res = await fetch("/api/music/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playlistId: pl.id,
        title: trackForm.title,
        artist: trackForm.artist,
        duration: durationSec,
        order: (pl.tracks?.length || 0),
      }),
    });
    if (res.ok) {
      const track = await res.json();
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === pl.id ? { ...p, tracks: [...(p.tracks || []), track] } : p
        )
      );
      setTrackForm({ title: "", artist: "", duration: "" });
      setAddingTo(null);
    }
    setSaving(false);
  };

  const deleteTrack = async (playlistId: string, trackId: string) => {
    await fetch(`/api/music/tracks/${trackId}`, { method: "DELETE" });
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
          : p
      )
    );
  };

  const moveTrack = async (playlistId: string, trackId: string, dir: "up" | "down") => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const tracks = [...playlist.tracks].sort((a, b) => a.order - b.order);
    const idx = tracks.findIndex((t) => t.id === trackId);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === tracks.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [tracks[idx].order, tracks[swapIdx].order] = [tracks[swapIdx].order, tracks[idx].order];
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, tracks } : p))
    );
    await fetch(`/api/music/tracks/${trackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: tracks[idx].order }),
    });
  };

  const exportPlaylist = (section: (typeof PLAYLIST_SECTIONS)[0]) => {
    const pl = getPlaylist(section.moment);
    if (!pl) return;
    const tracks = [...(pl.tracks || [])].sort((a, b) => a.order - b.order);
    const text = [
      `${section.emoji} ${section.label}`,
      `${"=".repeat(30)}`,
      ...tracks.map((t, i) => {
        const dur = t.duration ? ` (${formatDuration(t.duration)})` : "";
        return `${i + 1}. ${t.title} - ${t.artist}${dur}`;
      }),
      ``,
      `Total: ${tracks.length} músicas · ${formatTotalDuration(totalDuration(tracks))}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playlist-${section.moment}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchedTrack = (tracks: Track[]) => {
    if (!search) return [...tracks].sort((a, b) => a.order - b.order);
    const q = search.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    ).sort((a, b) => a.order - b.order);
  };

  const grandTotal = playlists.reduce(
    (sum, p) => sum + totalDuration(p.tracks || []),
    0
  );

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Music className="w-6 h-6 text-rose-500" /> Músicas do Casamento
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Organize as playlists para cada momento
            </p>
          </div>
          <div className="flex items-center gap-3">
            {grandTotal > 0 && (
              <span className="text-sm text-stone-500 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {formatTotalDuration(grandTotal)} total
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar música ou artista..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
        </div>

        {/* Spotify Section */}
        {spotifyConnected === false && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DB95415] flex items-center justify-center text-xl">🎵</div>
              <div>
                <p className="font-semibold text-stone-800 text-sm">Conectar ao Spotify</p>
                <p className="text-xs text-stone-500">Importe suas playlists do Spotify para os momentos do casamento</p>
              </div>
            </div>
            <a
              href="/api/integrations/spotify/connect"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#1DB954] text-white rounded-xl text-sm font-medium hover:bg-[#1aa34a] transition-colors"
            >
              Conectar Spotify
            </a>
          </div>
        )}

        {spotifyConnected === true && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1DB95415] flex items-center justify-center text-base">🎵</div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Spotify Conectado</p>
                  <p className="text-xs text-stone-500">Importe playlists para os momentos do casamento</p>
                </div>
              </div>
              <button
                onClick={fetchSpotifyPlaylists}
                disabled={loadingSpotify}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1DB954] text-white rounded-xl text-sm font-medium hover:bg-[#1aa34a] transition-colors disabled:opacity-50"
              >
                <ListMusic className="w-4 h-4" />
                {loadingSpotify ? "Carregando..." : "Ver Playlists"}
              </button>
            </div>

            {showSpotify && spotifyPlaylists.length > 0 && (
              <div className="divide-y divide-stone-50">
                {spotifyPlaylists.map((spl) => (
                  <div key={spl.id} className="px-5 py-3 flex items-center gap-3">
                    {spl.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spl.imageUrl} alt={spl.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0">🎵</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{spl.name}</p>
                      <p className="text-xs text-stone-400">{spl.totalTracks} músicas</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={importTarget}
                        onChange={(e) => setImportTarget(e.target.value)}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      >
                        <option value="">Escolha o momento</option>
                        {PLAYLIST_SECTIONS.map((s) => {
                          const pl = getPlaylist(s.moment);
                          return pl ? (
                            <option key={s.moment} value={pl.id}>{s.emoji} {s.label}</option>
                          ) : null;
                        })}
                      </select>
                      <button
                        onClick={() => importTarget && importSpotifyPlaylist(spl.id, importTarget)}
                        disabled={!importTarget || importingId === spl.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 disabled:opacity-40 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {importingId === spl.id ? "Importando..." : "Importar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSpotify && spotifyPlaylists.length === 0 && (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">
                Nenhuma playlist encontrada no Spotify.
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PLAYLIST_SECTIONS.map((section) => {
              const pl = getPlaylist(section.moment);
              const tracks = pl ? searchedTrack(pl.tracks || []) : [];
              const dur = pl ? totalDuration(pl.tracks || []) : 0;
              const isAdding = addingTo === section.moment;

              return (
                <div
                  key={section.moment}
                  className={`bg-white rounded-2xl border ${COLOR_MAP[section.color].split(" ")[1]} shadow-sm overflow-hidden`}
                >
                  {/* Section Header */}
                  <div className={`px-5 py-4 border-b ${COLOR_MAP[section.color]}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{section.emoji}</span>
                        <div>
                          <h2 className="font-bold text-sm">{section.label}</h2>
                          <p className="text-xs opacity-70">
                            {tracks.length} músicas
                            {dur > 0 && ` · ${formatTotalDuration(dur)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pl && (
                          <button
                            onClick={() => exportPlaylist(section)}
                            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                            title="Exportar playlist"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAddingTo(isAdding ? null : section.moment);
                            setTrackForm({ title: "", artist: "", duration: "" });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 hover:bg-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add Track Form */}
                  {isAdding && (
                    <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            value={trackForm.title}
                            onChange={(e) =>
                              setTrackForm({ ...trackForm, title: e.target.value })
                            }
                            placeholder="Título da música"
                            className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                          />
                          <input
                            value={trackForm.artist}
                            onChange={(e) =>
                              setTrackForm({ ...trackForm, artist: e.target.value })
                            }
                            placeholder="Artista"
                            className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={trackForm.duration}
                            onChange={(e) =>
                              setTrackForm({ ...trackForm, duration: e.target.value })
                            }
                            placeholder="Duração (ex: 3:45)"
                            className="w-32 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                          />
                          <button
                            onClick={() => addTrack(section.moment, section.label)}
                            disabled={saving}
                            className="flex-1 px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors"
                          >
                            {saving ? "..." : "Adicionar"}
                          </button>
                          <button
                            onClick={() => setAddingTo(null)}
                            className="px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-500 hover:bg-stone-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracks List */}
                  <div className="divide-y divide-stone-50">
                    {tracks.length === 0 ? (
                      <div className="px-5 py-8 text-center text-stone-400 text-sm">
                        Nenhuma música ainda. Adicione a primeira!
                      </div>
                    ) : (
                      tracks.map((track, idx) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 group transition-colors"
                        >
                          <span
                            className={`text-xs font-bold w-5 text-center ${BADGE_MAP[section.color]}`}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-stone-400 truncate">{track.artist}</p>
                          </div>
                          {track.duration && (
                            <span className="text-xs text-stone-400 flex-shrink-0">
                              {formatDuration(track.duration)}
                            </span>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => moveTrack(pl!.id, track.id, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                            </button>
                            <button
                              onClick={() => moveTrack(pl!.id, track.id, "down")}
                              disabled={idx === tracks.length - 1}
                              className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                            </button>
                            <button
                              onClick={() => deleteTrack(pl!.id, track.id)}
                              className="p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
