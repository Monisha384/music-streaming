"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

const getUser = () => typeof window !== "undefined" && localStorage.getItem("melodystream-user") === "true";
const serverSnapshot = () => false;

export default function Navbar() {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(subscribeToStorage, getUser, serverSnapshot);
  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("melodystream-user-info");
    const user = userStr ? JSON.parse(userStr) : {};
    if (user.id) {
      fetch(`/api/auth/notifications?userId=${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setNotifCount(data.notifications.filter((n: any) => !n.isRead).length);
          }
        });
    }
  }, [isLoggedIn]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/songs", label: "Songs" },
    { href: "/artists", label: "Artists" },
    { href: "/playlists", label: "Playlists" },
    { href: "/settings", label: "Settings" },
  ];

  function handleLogout() {
    localStorage.removeItem("melodystream-user");
    localStorage.removeItem("melodystream-admin");
    localStorage.removeItem("melodystream-email");
    localStorage.removeItem("melodystream-user-info");
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
          MelodyStream
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

        {/* Links (Mobile only) */}
        <div className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-col gap-4 pt-4 md:hidden ${linkColor}`}>
          <div className="flex flex-col gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition" onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Global Actions (Always visible) */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Notification Badge */}
          {isLoggedIn && (
            <Link href="/settings" className="relative group">
              <span className="text-lg">🔔</span>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifCount}
                </span>
              )}
            </Link>
          )}

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
    </nav>
  );
}
