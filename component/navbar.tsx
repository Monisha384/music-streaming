"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

const getUser = () => localStorage.getItem("musicverse-user") === "true";
const serverSnapshot = () => false;

export default function Navbar() {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(subscribeToStorage, getUser, serverSnapshot);
  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/songs", label: "Songs" },
    { href: "/artists", label: "Artists" },
    { href: "/playlists", label: "Playlists" },
  ];

  function handleLogout() {
    localStorage.removeItem("musicverse-user");
    localStorage.removeItem("musicverse-admin");
    localStorage.removeItem("musicverse-email");
    window.dispatchEvent(new Event("storage"));
    router.replace("/login");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/songs?search=${encodeURIComponent(search.trim())}`);
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navBg = isDark
    ? "bg-black/90 border-white/10 text-white"
    : "bg-white/95 border-zinc-200 text-zinc-900";
  const linkColor = isDark ? "text-zinc-300 hover:text-emerald-300" : "text-zinc-600 hover:text-emerald-600";
  const inputBg = isDark ? "bg-zinc-800 text-white placeholder-zinc-500" : "bg-zinc-100 text-zinc-900 placeholder-zinc-400";

  return (
    <nav className={`sticky top-0 z-50 border-b px-5 py-3 backdrop-blur transition-colors duration-300 ${navBg}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 md:flex-nowrap">
        <Link href="/" className="text-2xl font-bold text-emerald-400 flex-shrink-0">
          MusicVerse
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-2xl transition hover:text-emerald-400"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className={`flex flex-1 items-center min-w-[200px] order-3 w-full md:order-none md:w-auto md:min-w-0`}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists..."
            className={`w-full rounded-full px-4 py-1.5 text-sm outline-none ring-1 ring-white/10 focus:ring-emerald-400 transition ${inputBg}`}
          />
        </form>

        {/* Links */}
        <div className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-col gap-4 pt-4 md:flex md:w-auto md:flex-row md:items-center md:gap-4 md:pt-0 ${linkColor}`}>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition" onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-white/10 pt-4 md:border-none md:pt-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="text-lg transition hover:scale-110"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/15 px-4 py-1.5 transition hover:border-red-400 hover:text-red-400"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="rounded-full border border-white/15 px-4 py-1.5 transition hover:border-emerald-300 hover:text-emerald-300">
                  Login
                </Link>
                <Link href="/register" className="rounded-full bg-emerald-400 px-4 py-1.5 font-semibold text-black transition hover:bg-emerald-300">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
