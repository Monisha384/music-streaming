"use client";

import { usePlayer, RepeatMode } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const {
    currentSong, isPlaying, volume, isMuted, repeatMode, isShuffled,
    currentTime, duration, audioRef,
    togglePlay, nextSong, prevSong, setVolume, toggleMute, setRepeatMode, toggleShuffle, setCurrentTime,
  } = usePlayer();
  const { isDark } = useTheme();

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  }

  function cycleRepeat() {
    const modes: RepeatMode[] = ["none", "one", "all"];
    const next = modes[(modes.indexOf(repeatMode) + 1) % 3];
    setRepeatMode(next);
  }

  const bg = isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900";
  const sub = isDark ? "text-zinc-400" : "text-zinc-500";
  const btn = isDark ? "hover:text-emerald-400" : "hover:text-emerald-600";
  const active = "text-emerald-400";
  const sliderBg = isDark ? "accent-emerald-400" : "accent-emerald-600";

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 ${bg} transition-colors duration-300`}>
      {/* Progress bar */}
      <input
        type="range" min={0} max={duration || 1} step={0.1} value={currentTime}
        onChange={handleSeek}
        className={`mb-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 ${sliderBg}`}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Song info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {currentSong.image && (
            <img src={currentSong.image} alt={currentSong.title} className="h-10 w-10 flex-shrink-0 rounded object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentSong.title}</p>
            <p className={`truncate text-xs ${sub}`}>{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={toggleShuffle} title="Shuffle" className={`text-lg transition ${btn} ${isShuffled ? active : ""}`}>⇄</button>
          <button onClick={prevSong} title="Previous" className={`text-xl transition ${btn}`}>⏮</button>
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-black transition hover:bg-emerald-300"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={nextSong} title="Next" className={`text-xl transition ${btn}`}>⏭</button>
          <button onClick={cycleRepeat} title="Repeat" className={`text-lg transition ${btn} ${repeatMode !== "none" ? active : ""}`}>
            {repeatMode === "one" ? "🔂" : "🔁"}
          </button>
        </div>

        {/* Time + Volume */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <span className={`hidden text-xs tabular-nums md:inline ${sub}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button onClick={toggleMute} className={`text-lg transition ${btn}`}>
            {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </button>
          <input
            type="range" min={0} max={1} step={0.02} value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className={`hidden w-20 cursor-pointer md:block ${sliderBg}`}
          />
        </div>
      </div>
    </div>
  );
}
