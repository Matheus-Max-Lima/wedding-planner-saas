"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Music, Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string | null;
  duration: string | null;
  spotifyUrl: string | null;
  order: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  tracks: Track[];
}

const emptyPlaylist = { name: "", description: "" };
const emptyTrack = { title: "", artist: "", duration: "", spotifyUrl: "" };

export default function MusicPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState<string | null>(null); // playlistId
  const [playlistForm, setPlaylistForm] = useState(emptyPlaylist);
  const [trackForm, setTrackForm] = useState(emptyTrack);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/music/playlists").then(r => r.json());
    setPlaylists(data);
    setLoading(false);
    if (data.length > 0 && !expandedId) setExpandedId(data[0].id);
  }
  useEffect(() => { load(); }, []);

  async function addPlaylist() {
    if (!playlistForm.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      await fetch("/api/music/playlists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(playlistForm) });
      toast.success("Playlist criada!");
      await load();
      setPlaylistForm(emptyPlaylist);
      setShowPlaylistModal(false);
    } catch { toast.error("Erro ao criar"); }
    finally { setSaving(false); }
  }

  async function deletePlaylist(id: string) {
    await fetch(`/api/music/playlists/${id}`, { method: "DELETE" });
    toast.success("Playlist removida");
    await load();
  }

  async function addTrack(playlistId: string) {
    if (!trackForm.title.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    try {
      await fetch("/api/music/tracks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...trackForm, playlistId }) });
      toast.success("Música adicionada!");
      await load();
      setTrackForm(emptyTrack);
      setShowTrackModal(null);
    } catch { toast.error("Erro ao adicionar"); }
    finally { setSaving(false); }
  }

  async function deleteTrack(id: string) {
    await fetch(`/api/music/tracks/${id}`, { method: "DELETE" });
    toast.success("Música removida");
    await load();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" /></div>;

  const totalTracks = playlists.reduce((s, p) => s + p.tracks.length, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2"><Music className="w-6 h-6 text-rose-500" /> Música</h1>
          <p className="text-stone-500 text-sm mt-1">{playlists.length} playlists · {totalTracks} músicas</p>
        </div>
        <button onClick={() => setShowPlaylistModal(true)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all">
          <Plus className="w-4 h-4" /> Nova playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Music className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 mb-4">Nenhuma playlist criada ainda.</p>
          <button onClick={() => setShowPlaylistModal(true)} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm hover:bg-rose-600">Criar primeira playlist</button>
        </div>
      ) : (
        <div className="space-y-3">
          {playlists.map(playlist => (
            <div key={playlist.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-rose-200 transition-all">
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)" }}>
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800">{playlist.name}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{playlist.tracks.length} músicas{playlist.description ? ` · ${playlist.description}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setShowTrackModal(playlist.id); }}
                    className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === playlist.id ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </div>

              {expandedId === playlist.id && (
                <div className="border-t border-stone-100">
                  {playlist.tracks.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-stone-400 text-sm">Nenhuma música ainda</p>
                      <button onClick={() => setShowTrackModal(playlist.id)} className="mt-2 text-sm text-rose-500 hover:text-rose-600">Adicionar música</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-50">
                      {playlist.tracks.map((track, i) => (
                        <div key={track.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50">
                          <span className="text-xs text-stone-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-700 truncate">{track.title}</p>
                            {track.artist && <p className="text-xs text-stone-400">{track.artist}</p>}
                          </div>
                          {track.duration && <span className="text-xs text-stone-400 flex-shrink-0">{track.duration}</span>}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            {track.spotifyUrl && (
                              <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-stone-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button onClick={() => deleteTrack(track.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPlaylistModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Nova playlist</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Ex: Cerimônia, Festa..." value={playlistForm.name} onChange={e => setPlaylistForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={playlistForm.description} onChange={e => setPlaylistForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPlaylistModal(false)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={addPlaylist} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Criando..." : "Criar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Track Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTrackModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Adicionar música</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={trackForm.title} onChange={e => setTrackForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Artista</label>
                <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" value={trackForm.artist} onChange={e => setTrackForm(p => ({ ...p, artist: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Duração</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="3:45" value={trackForm.duration} onChange={e => setTrackForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Link Spotify</label>
                  <input className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="https://..." value={trackForm.spotifyUrl} onChange={e => setTrackForm(p => ({ ...p, spotifyUrl: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowTrackModal(null)} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={() => addTrack(showTrackModal)} disabled={saving} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60">{saving ? "Adicionando..." : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
