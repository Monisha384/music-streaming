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

function SongCard({ song, favorites, onToggleFav, onPlay, isDark }: {
  song: Song; favorites: string[];
  onToggleFav: (id: string) => void;
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
          <HeartButton song={song} favorites={favorites} onToggle={onToggleFav} />
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
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [language, setLanguage] = useState("All");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("recent");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "recent">("all");

  const email = typeof window !== "undefined" ? localStorage.getItem("musicverse-email") : null;

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

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/auth/favorites?email=${email}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setFavorites(d.favorites.map((s: Song) => s._id ?? s)); });
    fetch(`/api/auth/recently-played?email=${email}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setRecentlyPlayed(d.history.map((h: { song: Song }) => h.song).filter(Boolean)); });
  }, [email]);

  function handleToggleFav(songId: string) {
    if (!email) return;
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
            <Section title="🔥 Trending Songs" songs={trending} favorites={favorites} onToggleFav={handleToggleFav} onPlay={handlePlay} isDark={isDark} />
            <Section title="⭐ Top Rated" songs={topRated} favorites={favorites} onToggleFav={handleToggleFav} onPlay={handlePlay} isDark={isDark} />
            <Section title="🆕 Recently Added" songs={recentlyAdded} favorites={favorites} onToggleFav={handleToggleFav} onPlay={handlePlay} isDark={isDark} />
            <h2 className="mt-10 mb-4 text-2xl font-bold">All Songs</h2>
          </>
        )}

        {loading && <p className="mt-10 text-zinc-400">Loading songs...</p>}

        {!loading && displayedSongs.length === 0 && (
          <p className="mt-10 text-zinc-400">No songs found.</p>
        )}

        <div className="mt-4 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedSongs.map((song) => (
            <SongCard key={song._id} song={song} favorites={favorites} onToggleFav={handleToggleFav} onPlay={handlePlay} isDark={isDark} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Section({ title, songs, favorites, onToggleFav, onPlay, isDark }: {
  title: string; songs: Song[]; favorites: string[];
  onToggleFav: (id: string) => void;
  onPlay: (s: Song) => void;
  isDark: boolean;
}) {
  if (songs.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
        {songs.map((song) => (
          <SongCard key={song._id} song={song} favorites={favorites} onToggleFav={onToggleFav} onPlay={onPlay} isDark={isDark} />
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
