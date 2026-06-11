"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlayer, Song } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

const topArtists = [
  { name: "Yuvan Shankar Raja", image: "https://i.pinimg.com/736x/d6/46/f1/d646f139d9ecc7a21930ca7ed96d13e9.jpg" },
  { name: "Anirudh", image: "https://i.pinimg.com/736x/dd/c9/ab/ddc9ab7eb0f6ce83d3bf6f61e1ac09b2.jpg" },
  { name: "A. R. Rahman", image: "https://m.media-amazon.com/images/I/61hSmslpkjL._AC_UF894,1000_QL80_.jpg" },
  { name: "Ilayaraja", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6D1GzLMc6ONmfSxp3TdZ8fSrzNuQJsO0QyQ&s" },
  { name: "Karthi", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNmjkdULf4Dy6MXJKmOvfwVy3kgN4t2bzdRg&s" },
  { name: "The Weeknd", image: "https://s.yimg.com/ny/api/res/1.2/VR89fDq1nY6gYyF1Ooejgw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyNDI7aD04Mjg7Y2Y9d2VicA--/https://media.zenfs.com/en/billboard_547/4e4f00db1ff24daed58088bc84535cde" },
];

function SongRow({ song, onPlay, isDark }: { song: Song; onPlay: (s: Song) => void; isDark: boolean }) {
  const { currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?._id === song._id;
  return (
    <div
      onClick={() => onPlay(song)}
      className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition ${isActive
          ? "bg-emerald-400/10 ring-1 ring-emerald-400"
          : isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
        }`}
    >
      <div className="relative flex-shrink-0">
        {song.image
          ? <img src={song.image} alt={song.title} className="h-12 w-12 rounded object-cover" />
          : <div className={`h-12 w-12 rounded flex items-center justify-center text-xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>🎵</div>
        }
        {isActive && isPlaying && (
          <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-emerald-400 text-xs">▶</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{song.title}</p>
        <p className={`truncate text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{song.artist}</p>
      </div>
      {song.language && (
        <span className="flex-shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">{song.language}</span>
      )}
      <span className={`flex-shrink-0 text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>▶ {song.playCount ?? 0}</span>
    </div>
  );
}

export default function Home() {
  const { playSong } = usePlayer();
  const { isDark } = useTheme();
  const [trending, setTrending] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);

  useEffect(() => {
    fetch("/api/auth/songs?sort=trending")
      .then((r) => r.json())
      .then((d) => { if (d.success) setTrending(d.songs.slice(0, 5)); });
    fetch("/api/auth/songs?sort=recent")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRecent(d.songs.slice(0, 5)); });
  }, []);

  const sectionBg = isDark ? "bg-zinc-950" : "bg-zinc-100";
  const cardBg = isDark ? "bg-zinc-900" : "bg-white shadow";

  return (
    <main className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900"}`}>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <img
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1800&q=80"
          alt="Music stage"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">Premium Music Experience</p>
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
            Feel Every <span className="text-emerald-400">Beat</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-200 md:text-xl">
            Stream the latest Tamil and global hits. From Yuvan's melodies to Anirudh's energy, discover a universe of sound curated just for you.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <Link href="/songs" className="group relative overflow-hidden rounded-full bg-emerald-400 px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-emerald-300 active:scale-95">
              Start Listening
            </Link>
            <Link href="/playlists" className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:border-white/80 hover:bg-white/20 active:scale-95">
              My Playlists
            </Link>
          </div>
        </div>
      </section>

      {/* Trending + Recent */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className={`rounded-xl p-6 ${cardBg}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">🔥 Trending Now</h2>
              <Link href="/songs?sort=trending" className="text-sm text-emerald-400 hover:text-emerald-300">View all</Link>
            </div>
            <div className="grid gap-1">
              {trending.length === 0 && <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>No songs yet.</p>}
              {trending.map((s) => <SongRow key={s._id} song={s} onPlay={(s) => playSong(s, trending)} isDark={isDark} />)}
            </div>
          </div>

          <div className={`rounded-xl p-6 ${cardBg}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">🆕 Recently Added</h2>
              <Link href="/songs?sort=recent" className="text-sm text-emerald-400 hover:text-emerald-300">View all</Link>
            </div>
            <div className="grid gap-1">
              {recent.length === 0 && <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>No songs yet.</p>}
              {recent.map((s) => <SongRow key={s._id} song={s} onPlay={(s) => playSong(s, recent)} isDark={isDark} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Artists */}
      <section className={`${sectionBg} px-6 py-16`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-bold">Top Artists</h2>
            <Link href="/artists" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">View all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-6">
            {topArtists.map((a) => (
              <Link href={`/songs?search=${encodeURIComponent(a.name)}`} key={a.name} className="text-center group">
                <img src={a.image} alt={a.name} className="mx-auto mb-3 h-24 w-24 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-emerald-400 transition" />
                <p className="text-sm font-medium">{a.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className={`py-8 text-center text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
        © 2026 MusicVerse. All Rights Reserved.
      </footer>
    </main>
  );
}
