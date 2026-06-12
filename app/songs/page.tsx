"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer, Song } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

const LANGUAGES = ["All", "Tamil", "English", "Hindi", "Telugu", "Malayalam", "Other"];
const GENRES = ["All", "Melody", "Folk", "Pop", "Rock", "Classical", "Mass", "Romantic", "Other"];
const SORTS = [
  { value: "recent", label: "Recently Added" },
  { value: "trending", label: "Trending" },
  { value: "topRated", label: "Top Rated" },
];

function HeartButton({ song, favorites, onToggle }: { song: Song; favorites: string[]; onToggle: (id: string) => void }) {
  const liked = favorites.includes(song._id);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(song._id); }}
      className={`text-xl transition hover:scale-110 ${liked ? "text-red-500" : "text-zinc-500 hover:text-red-400"}`}
      title={liked ? "Remove from favorites" : "Add to favorites"}
    >
      {liked ? "♥" : "♡"}
    </button>
  );
}

function AddToPlaylistModal({ song, playlists, onClose, onAdd, isDark }: {
  song: Song; playlists: any[]; onClose: () => void; onAdd: (playlistId: string) => void; isDark: boolean;
}) {
  const box = isDark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900";
  const hover = isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100";
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className={`w-full max-w-xs rounded-xl shadow-2xl p-4 ${box}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-center font-bold">Add to Playlist</h3>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {playlists.length === 0 && <p className="text-sm text-center text-zinc-500 py-4">No playlists found.</p>}
          {playlists.map((p) => (
            <button
              key={p._id}
              onClick={() => onAdd(p._id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${hover}`}
            >
              📁 {p.name}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-lg py-2 text-sm text-zinc-500 hover:text-white transition">Close</button>
      </div>
    </div>
  );
}

function SongCard({ song, favorites, onToggleFav, onAddToPlaylist, onPlay, isDark }: {
  song: Song; favorites: string[];
  onToggleFav: (id: string) => void;
  onAddToPlaylist: (song: Song) => void;
  onPlay: (song: Song) => void;
  isDark: boolean;
}) {
  const { currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?._id === song._id;
  const cardBg = isDark
    ? `rounded-lg bg-zinc-900 transition hover:-translate-y-1 hover:bg-zinc-800 ${isActive ? "ring-2 ring-emerald-400" : ""}`
    : `rounded-lg bg-white shadow transition hover:-translate-y-1 hover:shadow-md ${isActive ? "ring-2 ring-emerald-500" : ""}`;

  return (
    <div className={`group overflow-hidden cursor-pointer ${cardBg}`} onClick={() => onPlay(song)}>
      <div className="relative">
        {song.image ? (
          <img src={song.image} alt={song.title} className="h-44 w-full object-cover" />
        ) : (
          <div className={`h-44 w-full flex items-center justify-center text-4xl ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>🎵</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <span className="text-4xl text-white">{isActive && isPlaying ? "⏸" : "▶"}</span>
        </div>
        {song.language && (
          <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-emerald-300">
            {song.language}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`truncate font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{song.title}</p>
            <p className={`truncate text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{song.artist}</p>
            {song.genre && <span className={`mt-1 inline-block text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{song.genre}</span>}
          </div>
          <div className="flex flex-col items-center gap-2">
            <HeartButton song={song} favorites={favorites} onToggle={onToggleFav} />
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToPlaylist(song); }}
              className="text-lg text-zinc-500 hover:text-emerald-400 transition"
              title="Add to playlist"
            >
              +
            </button>
          </div>
        </div>
        {song.playCount !== undefined && (
          <p className={`mt-2 text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>▶ {song.playCount} plays</p>
        )}
      </div>
    </div>
  );
}

function SongsContent() {
  const searchParams = useSearchParams();
  const { playSong } = usePlayer();
  const { isDark } = useTheme();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.get("search") ?? "");
  const [language, setLanguage] = useState("All");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("recent");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "recent">("all");
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Song | null>(null);

  const fetchSongs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (language !== "All") params.set("language", language);
    if (genre !== "All") params.set("genre", genre);
    params.set("sort", sort);

    fetch(`/api/auth/songs?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSongs(d.songs); })
      .finally(() => setLoading(false));
  }, [search, language, genre, sort]);

  useEffect(() => {
    fetchSongs();
    const email = typeof window !== "undefined" ? localStorage.getItem("melodystream-email") : null;
    if (email) {
      fetch(`/api/auth/user-playlists?email=${email}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setPlaylists(d.playlists || []); });
    }
  }, [fetchSongs]);

  useEffect(() => {
    const email = typeof window !== "undefined" ? localStorage.getItem("melodystream-email") : null;
    if (!email) {
      const localFavs = JSON.parse(localStorage.getItem("melodystream-guest-favorites") || "[]");
      setFavorites(localFavs);
      return;
    }
    fetch(`/api/auth/favorites?email=${email}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.favorites) {
          // Filter out nulls in case of soft-deleted/missing songs
          setFavorites(d.favorites.map((s: any) => (s && typeof s === 'object' ? s._id : s)).filter(Boolean));
        }
      });
    fetch(`/api/auth/recently-played?email=${email}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setRecentlyPlayed(d.history.map((h: { song: Song }) => h.song).filter(Boolean)); });
  }, []);

  function handleToggleFav(songId: string) {
    const email = typeof window !== "undefined" ? localStorage.getItem("melodystream-email") : null;
    if (!email) {
      const localFavs = JSON.parse(localStorage.getItem("melodystream-guest-favorites") || "[]");
      const idx = localFavs.indexOf(songId);
      if (idx > -1) localFavs.splice(idx, 1);
      else localFavs.push(songId);
      localStorage.setItem("melodystream-guest-favorites", JSON.stringify(localFavs));
      setFavorites([...localFavs]);
      return;
    }
    fetch("/api/auth/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, songId }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setFavorites(d.favorites); });
  }

  function handlePlay(song: Song) {
    playSong(song, songs);
  }

  async function handleAddToPlaylist(playlistId: string) {
    if (!showAddToPlaylist) return;
    const res = await fetch(`/api/auth/user-playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId: showAddToPlaylist._id, action: "add" }),
    });
    const d = await res.json();
    if (d.success) {
      alert(`Added ${showAddToPlaylist.title} to playlist!`);
      setShowAddToPlaylist(null);
    }
  }

  const bg = isDark ? "min-h-screen bg-black text-white" : "min-h-screen bg-zinc-50 text-zinc-900";
  const inputBg = isDark ? "bg-zinc-800 text-white placeholder-zinc-500 ring-white/10" : "bg-white text-zinc-900 placeholder-zinc-400 ring-zinc-200";
  const selectBg = isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-900 border border-zinc-200";
  const tabActive = isDark ? "bg-emerald-400 text-black" : "bg-emerald-500 text-white";
  const tabInactive = isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300";

  const displayedSongs = activeTab === "favorites"
    ? songs.filter((s) => favorites.includes(s._id))
    : activeTab === "recent"
      ? recentlyPlayed
      : songs;

  const trending = [...songs].sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0)).slice(0, 4);
  const topRated = [...songs].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  const recentlyAdded = [...songs].slice(0, 4);

  return (
    <main className={`${bg} px-6 py-10`}>
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Songs Library</p>
        <h1 className="mt-2 text-4xl font-bold">All Songs</h1>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, artist, album..."
            className={`flex-1 min-w-48 rounded-lg px-4 py-2 text-sm outline-none ring-1 focus:ring-emerald-400 transition ${inputBg}`}
          />
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`rounded-lg px-3 py-2 text-sm outline-none ${selectBg}`}>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={`rounded-lg px-3 py-2 text-sm outline-none ${selectBg}`}>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={`rounded-lg px-3 py-2 text-sm outline-none ${selectBg}`}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          {(["all", "favorites", "recent"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition capitalize ${activeTab === tab ? tabActive : tabInactive}`}>
              {tab === "all" ? "All Songs" : tab === "favorites" ? "❤ Favorites" : "🕐 Recently Played"}
            </button>
          ))}
        </div>

        {/* Sections (only in All tab with no filters) */}
        {activeTab === "all" && !search && language === "All" && genre === "All" && (
          <>
            <Section title="🔥 Trending Songs" songs={trending} favorites={favorites} onToggleFav={handleToggleFav} onAddToPlaylist={setShowAddToPlaylist} onPlay={handlePlay} isDark={isDark} />
            <Section title="⭐ Top Rated" songs={topRated} favorites={favorites} onToggleFav={handleToggleFav} onAddToPlaylist={setShowAddToPlaylist} onPlay={handlePlay} isDark={isDark} />
            <Section title="🆕 Recently Added" songs={recentlyAdded} favorites={favorites} onToggleFav={handleToggleFav} onAddToPlaylist={setShowAddToPlaylist} onPlay={handlePlay} isDark={isDark} />
            <h2 className="mt-10 mb-4 text-2xl font-bold">All Songs</h2>
          </>
        )}

        {loading && <p className="mt-10 text-zinc-400">Loading songs...</p>}

        {!loading && displayedSongs.length === 0 && (
          <p className="mt-10 text-zinc-400">No songs found.</p>
        )}

        <div className="mt-4 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedSongs.map((song) => (
            <SongCard key={song._id} song={song} favorites={favorites} onToggleFav={handleToggleFav} onAddToPlaylist={setShowAddToPlaylist} onPlay={handlePlay} isDark={isDark} />
          ))}
        </div>

        {showAddToPlaylist && (
          <AddToPlaylistModal
            song={showAddToPlaylist}
            playlists={playlists}
            onClose={() => setShowAddToPlaylist(null)}
            onAdd={handleAddToPlaylist}
            isDark={isDark}
          />
        )}
      </div>
    </main>
  );
}

function Section({ title, songs, favorites, onToggleFav, onAddToPlaylist, onPlay, isDark }: {
  title: string; songs: Song[]; favorites: string[];
  onToggleFav: (id: string) => void;
  onAddToPlaylist: (song: Song) => void;
  onPlay: (s: Song) => void;
  isDark: boolean;
}) {
  if (songs.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
        {songs.map((song) => (
          <SongCard key={song._id} song={song} favorites={favorites} onToggleFav={onToggleFav} onAddToPlaylist={onAddToPlaylist} onPlay={onPlay} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}

export default function Songs() {
  return (
    <Suspense>
      <SongsContent />
    </Suspense>
  );
}
