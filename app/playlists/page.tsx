"use client";

import { useEffect, useState, FormEvent } from "react";
import { usePlayer, Song } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

interface UserPlaylist {
  _id: string;
  name: string;
  songs: Song[];
}

export default function Playlists() {
  const { playSong } = usePlayer();
  const { isDark } = useTheme();

  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const email = typeof window !== "undefined" ? localStorage.getItem("musicverse-email") : null;

  useEffect(() => {
    if (!email) return;
    fetch(`/api/auth/user-playlists?email=${email}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setPlaylists(d.playlists); })
      .finally(() => setLoading(false));
  }, [email]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !email) return;
    const res = await fetch("/api/auth/user-playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: newName.trim() }),
    });
    const d = await res.json();
    if (d.success) { setPlaylists(d.playlists); setNewName(""); }
  }

  async function handleRename(playlistId: string) {
    if (!editName.trim() || !email) return;
    const res = await fetch(`/api/auth/user-playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: editName.trim(), action: "rename" }),
    });
    const d = await res.json();
    if (d.success) {
      setPlaylists((prev) => prev.map((p) => p._id === playlistId ? { ...p, name: editName.trim() } : p));
      setEditingId(null);
    }
  }

  async function handleDelete(playlistId: string) {
    if (!email) return;
    const res = await fetch(`/api/auth/user-playlists/${playlistId}?email=${email}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) setPlaylists(d.playlists);
  }

  async function handleRemoveSong(playlistId: string, songId: string) {
    if (!email) return;
    const res = await fetch(`/api/auth/user-playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, songId, action: "removeSong" }),
    });
    const d = await res.json();
    if (d.success) {
      setPlaylists((prev) => prev.map((p) =>
        p._id === playlistId ? { ...p, songs: p.songs.filter((s) => s._id !== songId) } : p
      ));
    }
  }

  const bg = isDark ? "min-h-screen bg-black text-white" : "min-h-screen bg-zinc-50 text-zinc-900";
  const cardBg = isDark ? "bg-zinc-900" : "bg-white shadow";
  const inputBg = isDark ? "bg-zinc-800 text-white placeholder-zinc-500 ring-white/10" : "bg-zinc-100 text-zinc-900 ring-zinc-200";
  const sub = isDark ? "text-zinc-400" : "text-zinc-500";

  return (
    <main className={`${bg} px-6 py-10`}>
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Your Music</p>
        <h1 className="mt-2 text-4xl font-bold">My Playlists</h1>

        {/* Create */}
        <form onSubmit={handleCreate} className="mt-6 flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New playlist name..."
            className={`flex-1 rounded-lg px-4 py-2 text-sm outline-none ring-1 focus:ring-emerald-400 transition ${inputBg}`}
          />
          <button type="submit" className="rounded-lg bg-emerald-400 px-5 py-2 font-semibold text-black hover:bg-emerald-300 transition">
            + Create
          </button>
        </form>

        {loading && <p className="mt-10 text-zinc-400">Loading playlists...</p>}

        {!loading && playlists.length === 0 && (
          <p className={`mt-10 ${sub}`}>No playlists yet. Create one above!</p>
        )}

        <div className="mt-8 grid gap-5">
          {playlists.map((playlist) => (
            <div key={playlist._id} className={`rounded-xl p-5 ${cardBg}`}>
              <div className="flex items-center justify-between gap-3">
                {editingId === playlist._id ? (
                  <div className="flex flex-1 gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`flex-1 rounded px-3 py-1 text-sm outline-none ring-1 focus:ring-emerald-400 ${inputBg}`}
                    />
                    <button onClick={() => handleRename(playlist._id)} className="rounded bg-emerald-400 px-3 py-1 text-sm font-semibold text-black hover:bg-emerald-300">Save</button>
                    <button onClick={() => setEditingId(null)} className={`rounded px-3 py-1 text-sm ${sub}`}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-3 cursor-pointer" onClick={() => setOpenId(openId === playlist._id ? null : playlist._id)}>
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="font-semibold">{playlist.name}</p>
                      <p className={`text-sm ${sub}`}>{playlist.songs.length} song{playlist.songs.length !== 1 ? "s" : ""}</p>
                    </div>
                    <span className={`ml-2 text-sm ${sub}`}>{openId === playlist._id ? "▲" : "▼"}</span>
                  </div>
                )}

                <div className="flex gap-2 flex-shrink-0">
                  {playlist.songs.length > 0 && (
                    <button
                      onClick={() => playSong(playlist.songs[0], playlist.songs)}
                      className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-300 transition"
                    >
                      ▶ Play
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingId(playlist._id); setEditName(playlist.name); }}
                    className={`rounded px-2 py-1 text-sm transition hover:text-emerald-400 ${sub}`}
                    title="Rename"
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(playlist._id)}
                    className={`rounded px-2 py-1 text-sm transition hover:text-red-400 ${sub}`}
                    title="Delete"
                  >🗑</button>
                </div>
              </div>

              {/* Songs in playlist */}
              {openId === playlist._id && (
                <div className="mt-4 grid gap-2">
                  {playlist.songs.length === 0 && <p className={`text-sm ${sub}`}>No songs in this playlist.</p>}
                  {playlist.songs.map((song) => (
                    <div
                      key={song._id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
                    >
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => playSong(song, playlist.songs)}>
                        {song.image && <img src={song.image} alt={song.title} className="h-9 w-9 rounded object-cover" />}
                        <div>
                          <p className="text-sm font-medium">{song.title}</p>
                          <p className={`text-xs ${sub}`}>{song.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSong(playlist._id, song._id)}
                        className={`text-sm transition hover:text-red-400 ${sub}`}
                        title="Remove"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
