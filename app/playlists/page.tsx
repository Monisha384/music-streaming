"use client";

import { useEffect, useState, FormEvent } from "react";
import { usePlayer, Song } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

interface UserPlaylist {
  _id: string;
  name: string;
  songs: Song[];
}

/** Modal to pick songs and add them to a specific playlist */
function AddSongsModal({
  playlist,
  email,
  onClose,
  onUpdated,
  isDark,
}: {
  playlist: UserPlaylist;
  email: string;
  onClose: () => void;
  onUpdated: (playlistId: string, song: Song) => void;
  isDark: boolean;
}) {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/songs?sort=recent&limit=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAllSongs(d.songs); });
  }, []);

  const filtered = allSongs.filter((s) =>
    !search.trim() ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  const inPlaylist = new Set(playlist.songs.map((s) => s._id));

  async function handleAdd(song: Song) {
    setAdding(song._id);
    await fetch(`/api/auth/user-playlists/${playlist._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId: song._id, action: "add" }),
    });
    onUpdated(playlist._id, song);
    setAdding(null);
  }

  const overlay = "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";
  const box = isDark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900";
  const inputBg = isDark ? "bg-zinc-800 text-white placeholder-zinc-500 ring-white/10" : "bg-zinc-100 text-zinc-900 ring-zinc-200";
  const rowHover = isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100";
  const sub = isDark ? "text-zinc-400" : "text-zinc-500";

  return (
    <div className={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${box} flex flex-col max-h-[80vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Adding to</p>
            <h2 className="text-xl font-bold">{playlist.name}</h2>
          </div>
          <button onClick={onClose} className="text-2xl text-zinc-400 hover:text-white transition">✕</button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs or artists..."
            className={`w-full rounded-lg px-4 py-2 text-sm outline-none ring-1 focus:ring-emerald-400 transition ${inputBg}`}
            autoFocus
          />
        </div>

        {/* Song list */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {filtered.length === 0 && (
            <p className={`mt-6 text-center text-sm ${sub}`}>No songs found.</p>
          )}
          {filtered.map((song) => {
            const isIn = inPlaylist.has(song._id);
            return (
              <div
                key={song._id}
                className={`flex items-center gap-3 rounded-lg p-2 transition ${rowHover}`}
              >
                {song.image
                  ? <img src={song.image} alt={song.title} className="h-10 w-10 rounded object-cover flex-shrink-0" />
                  : <div className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>🎵</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-sm">{song.title}</p>
                  <p className={`truncate text-xs ${sub}`}>{song.artist}</p>
                </div>
                {isIn ? (
                  <span className="flex-shrink-0 text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-400/10">
                    ✓ Added
                  </span>
                ) : (
                  <button
                    onClick={() => handleAdd(song)}
                    disabled={adding === song._id}
                    className="flex-shrink-0 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-black px-3 py-1.5 rounded-full transition disabled:opacity-50"
                  >
                    {adding === song._id ? "..." : "+ Add"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Playlists() {
  const { playSong } = usePlayer();
  const { isDark } = useTheme();

  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addSongsTo, setAddSongsTo] = useState<UserPlaylist | null>(null);

  const email = typeof window !== "undefined" ? localStorage.getItem("melodystream-email") : null;

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      if (email) {
        const r = await fetch(`/api/auth/user-playlists?email=${email}`);
        const d = await r.json();
        if (d.success) setPlaylists(d.playlists ?? []);
      }
      setLoading(false);
    };

    const fetchLiked = async () => {
      if (email) {
        const r = await fetch(`/api/auth/favorites?email=${email}`);
        const d = await r.json();
        if (d.success) setLikedSongs(d.favorites ?? []);
      } else {
        // Guest Liked Songs
        const localFavs = JSON.parse(localStorage.getItem("melodystream-guest-favorites") || "[]");
        if (localFavs.length > 0) {
          // Fetch song details for local favorites
          const r = await fetch("/api/auth/songs?limit=100");
          const d = await r.json();
          if (d.success) {
            const favSongs = d.songs.filter((s: Song) => localFavs.includes(s._id));
            setLikedSongs(favSongs);
          }
        }
      }
    };

    fetchPlaylists();
    fetchLiked();
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
    if (d.success) {
      // Refetch to get the full list with the new playlist
      const r2 = await fetch(`/api/auth/user-playlists?email=${email}`);
      const d2 = await r2.json();
      if (d2.success) setPlaylists(d2.playlists ?? []);
      setNewName("");
    }
  }

  async function handleRename(playlistId: string) {
    if (!editName.trim() || !email) return;
    await fetch(`/api/auth/user-playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: editName.trim(), action: "rename" }),
    });
    setPlaylists((prev) => prev.map((p) => p._id === playlistId ? { ...p, name: editName.trim() } : p));
    setEditingId(null);
  }

  async function handleDelete(playlistId: string) {
    if (!email) return;
    await fetch(`/api/auth/user-playlists/${playlistId}?email=${email}`, { method: "DELETE" });
    setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
    if (openId === playlistId) setOpenId(null);
  }

  async function handleRemoveSong(playlistId: string, songId: string) {
    await fetch(`/api/auth/user-playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId, action: "removeSong" }),
    });
    setPlaylists((prev) => prev.map((p) =>
      p._id === playlistId ? { ...p, songs: p.songs.filter((s) => s._id !== songId) } : p
    ));
  }

  function handleSongAdded(playlistId: string, song: Song) {
    setPlaylists((prev) => prev.map((p) =>
      p._id === playlistId && !p.songs.find((s) => s._id === song._id)
        ? { ...p, songs: [...p.songs, song] }
        : p
    ));
    // Also update addSongsTo modal so it reflects the change
    if (addSongsTo?._id === playlistId) {
      setAddSongsTo((prev) => prev && !prev.songs.find((s) => s._id === song._id)
        ? { ...prev, songs: [...prev.songs, song] }
        : prev
      );
    }
  }

  const bg = isDark ? "min-h-screen bg-black text-white" : "min-h-screen bg-zinc-50 text-zinc-900";
  const cardBg = isDark ? "bg-zinc-900 border border-white/5" : "bg-white shadow border border-zinc-100";
  const inputBg = isDark ? "bg-zinc-800 text-white placeholder-zinc-500 ring-white/10" : "bg-zinc-100 text-zinc-900 ring-zinc-200";
  const sub = isDark ? "text-zinc-400" : "text-zinc-500";

  return (
    <main className={`${bg} px-6 py-10`}>
      {/* Add Songs Modal */}
      {addSongsTo && email && (
        <AddSongsModal
          playlist={addSongsTo}
          email={email}
          onClose={() => setAddSongsTo(null)}
          onUpdated={handleSongAdded}
          isDark={isDark}
        />
      )}

      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Your Music</p>
        <h1 className="mt-2 text-4xl font-bold">My Playlists</h1>

        {/* Login prompt */}
        {!email && !loading && (
          <div className={`mt-10 rounded-xl p-8 text-center ${cardBg}`}>
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-lg font-semibold">Login to manage playlists</p>
            <p className={`mt-1 text-sm ${sub}`}>Sign in to create and save your favourite songs.</p>
          </div>
        )}

        {/* Create form */}
        {email && (
          <form onSubmit={handleCreate} className="mt-6 flex gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New playlist name..."
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm outline-none ring-1 focus:ring-emerald-400 transition ${inputBg}`}
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-lg bg-emerald-400 px-5 py-2.5 font-semibold text-black hover:bg-emerald-300 transition disabled:opacity-50"
            >
              + Create
            </button>
          </form>
        )}

        {loading && (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          </div>
        )}

        {!loading && email && playlists.length === 0 && (
          <div className={`mt-10 rounded-xl p-10 text-center ${cardBg}`}>
            <p className="text-5xl mb-4">🎶</p>
            <p className="text-lg font-semibold">No playlists yet</p>
            <p className={`mt-2 text-sm ${sub}`}>Create a playlist above, then add your favourite songs!</p>
          </div>
        )}

        {/* Playlists list */}
        <div className="mt-6 grid gap-4">
          {/* Liked Songs "Virtual" Playlist */}
          {(likedSongs.length > 0 || !email) && (
            <div className={`rounded-xl overflow-hidden ${cardBg} border-emerald-400/20`}>
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => setOpenId(openId === "liked" ? null : "liked")}
                  className="flex flex-1 items-center gap-4 text-left group"
                >
                  <div className={`h-14 w-14 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl bg-emerald-400/10 text-red-500`}>
                    ♥
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-emerald-400 transition">Liked Songs</p>
                    <p className={`text-sm ${sub}`}>{likedSongs.length} song{likedSongs.length !== 1 ? "s" : ""}</p>
                  </div>
                  <span className={`ml-auto text-sm flex-shrink-0 ${sub}`}>{openId === "liked" ? "▲" : "▼"}</span>
                </button>
                {likedSongs.length > 0 && (
                  <button
                    onClick={() => playSong(likedSongs[0], likedSongs)}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-400 transition"
                  >
                    ▶ Play
                  </button>
                )}
              </div>

              {openId === "liked" && (
                <div className={`border-t px-4 py-3 ${isDark ? "border-white/5" : "border-zinc-100"}`}>
                  {likedSongs.length === 0 ? (
                    <p className={`py-4 text-center text-sm ${sub}`}>You haven't liked any songs yet.</p>
                  ) : (
                    <div className="grid gap-1">
                      {likedSongs.map((song, idx) => (
                        <div
                          key={song._id}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-50"}`}
                        >
                          <span className={`text-xs w-5 text-center flex-shrink-0 ${sub}`}>{idx + 1}</span>
                          {song.image
                            ? <img src={song.image} alt="" className="h-9 w-9 rounded object-cover flex-shrink-0" />
                            : <div className={`h-9 w-9 rounded flex items-center justify-center flex-shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>🎵</div>
                          }
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(song, likedSongs)}>
                            <p className="text-sm font-medium truncate">{song.title}</p>
                            <p className={`text-xs truncate ${sub}`}>{song.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {playlists.map((playlist) => (
            <div key={playlist._id} className={`rounded-xl overflow-hidden ${cardBg}`}>
              {/* Playlist header */}
              <div className="flex items-center gap-3 p-4">
                {/* Expand toggle */}
                <button
                  onClick={() => setOpenId(openId === playlist._id ? null : playlist._id)}
                  className={`flex flex-1 items-center gap-4 text-left group`}
                >
                  <div className={`h-14 w-14 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                    {playlist.songs[0]?.image
                      ? <img src={playlist.songs[0].image} alt="" className="h-full w-full rounded-xl object-cover" />
                      : "🎵"
                    }
                  </div>
                  <div className="min-w-0">
                    {editingId === playlist._id ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`flex-1 rounded px-3 py-1 text-sm outline-none ring-1 focus:ring-emerald-400 ${inputBg}`}
                          autoFocus
                        />
                        <button onClick={() => handleRename(playlist._id)} className="rounded bg-emerald-400 px-3 py-1 text-sm font-semibold text-black hover:bg-emerald-300">Save</button>
                        <button onClick={() => setEditingId(null)} className={`rounded px-3 py-1 text-sm ${sub}`}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold truncate group-hover:text-emerald-400 transition">{playlist.name}</p>
                        <p className={`text-sm ${sub}`}>{playlist.songs.length} song{playlist.songs.length !== 1 ? "s" : ""}</p>
                      </>
                    )}
                  </div>
                  {editingId !== playlist._id && (
                    <span className={`ml-auto text-sm flex-shrink-0 ${sub}`}>{openId === playlist._id ? "▲" : "▼"}</span>
                  )}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {playlist.songs.length > 0 && (
                    <button
                      onClick={() => playSong(playlist.songs[0], playlist.songs)}
                      className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-bold text-black hover:bg-emerald-300 transition"
                      title="Play all"
                    >
                      ▶ Play
                    </button>
                  )}
                  <button
                    onClick={() => setAddSongsTo(playlist)}
                    className="rounded-full border border-emerald-400/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-400/10 transition"
                    title="Add songs"
                  >
                    + Songs
                  </button>
                  <button
                    onClick={() => { setEditingId(playlist._id); setEditName(playlist.name); }}
                    className={`rounded px-2 py-1.5 text-sm transition hover:text-emerald-400 ${sub}`}
                    title="Rename"
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(playlist._id)}
                    className={`rounded px-2 py-1.5 text-sm transition hover:text-red-400 ${sub}`}
                    title="Delete playlist"
                  >🗑</button>
                </div>
              </div>

              {/* Songs list (expanded) */}
              {openId === playlist._id && (
                <div className={`border-t px-4 py-3 ${isDark ? "border-white/5" : "border-zinc-100"}`}>
                  {playlist.songs.length === 0 ? (
                    <div className="flex flex-col items-center py-6 gap-3">
                      <p className={`text-sm ${sub}`}>No songs yet.</p>
                      <button
                        onClick={() => setAddSongsTo(playlist)}
                        className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-bold text-black hover:bg-emerald-300 transition"
                      >
                        + Add Songs
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-1">
                      {playlist.songs.map((song, idx) => (
                        <div
                          key={song._id}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-50"}`}
                        >
                          <span className={`text-xs w-5 text-center flex-shrink-0 ${sub}`}>{idx + 1}</span>
                          {song.image
                            ? <img src={song.image} alt={song.title} className="h-9 w-9 rounded object-cover flex-shrink-0" />
                            : <div className={`h-9 w-9 rounded flex items-center justify-center flex-shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>🎵</div>
                          }
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(song, playlist.songs)}>
                            <p className="text-sm font-medium truncate">{song.title}</p>
                            <p className={`text-xs truncate ${sub}`}>{song.artist}</p>
                          </div>
                          {song.language && (
                            <span className="flex-shrink-0 text-xs rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-400">{song.language}</span>
                          )}
                          <button
                            onClick={() => handleRemoveSong(playlist._id, song._id)}
                            className={`flex-shrink-0 text-sm transition hover:text-red-400 ${sub}`}
                            title="Remove from playlist"
                          >✕</button>
                        </div>
                      ))}
                      <button
                        onClick={() => setAddSongsTo(playlist)}
                        className={`mt-2 w-full rounded-lg border border-dashed py-2 text-sm font-medium transition ${isDark ? "border-zinc-700 text-zinc-500 hover:border-emerald-400 hover:text-emerald-400" : "border-zinc-300 text-zinc-400 hover:border-emerald-500 hover:text-emerald-500"}`}
                      >
                        + Add more songs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
