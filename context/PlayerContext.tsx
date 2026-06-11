"use client";

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  image?: string;
  audio?: string;
  language?: string;
  genre?: string;
  playCount?: number;
  rating?: number;
}

export type RepeatMode = "none" | "one" | "all";

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setRepeatMode: (m: RepeatMode) => void;
  toggleShuffle: () => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    if (newQueue) setQueue(newQueue);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = song.audio ?? "";
        audioRef.current.play().catch(() => {});
      }
    }, 50);

    // Track play count & recently played
    fetch("/api/auth/songs/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId: song._id }),
    }).catch(() => {});

    const email = localStorage.getItem("musicverse-email");
    if (email) {
      fetch("/api/auth/recently-played", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, songId: song._id }),
      }).catch(() => {});
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s._id === currentSong._id);
    let nextIdx: number;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (idx + 1) % queue.length;
    }
    playSong(queue[nextIdx], queue);
  }, [currentSong, queue, isShuffled, playSong]);

  const prevSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s._id === currentSong._id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    playSong(queue[prevIdx], queue);
  }, [currentSong, queue, playSong]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
  }, [isMuted]);

  const toggleShuffle = useCallback(() => setIsShuffled((s) => !s), []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, queue, isPlaying, volume, isMuted,
        repeatMode, isShuffled, currentTime, duration, audioRef,
        playSong, togglePlay, nextSong, prevSong,
        setVolume, toggleMute, setRepeatMode, toggleShuffle,
        setCurrentTime, setDuration,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => {
          if (repeatMode === "one") {
            audioRef.current?.play().catch(() => {});
          } else if (repeatMode === "all" || isShuffled) {
            nextSong();
          } else {
            const idx = queue.findIndex((s) => s._id === currentSong?._id);
            if (idx < queue.length - 1) nextSong();
            else setIsPlaying(false);
          }
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
