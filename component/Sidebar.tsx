"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { isDark } = useTheme();

    const links = [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/songs", label: "Songs", icon: "🎵" },
        { href: "/artists", label: "Artists", icon: "👥" },
        { href: "/playlists", label: "Playlists", icon: "📜" },
    ];

    const sidebarBg = isDark ? "bg-zinc-950 border-white/5" : "bg-white border-zinc-200";
    const activeClass = "bg-emerald-400/10 text-emerald-400";
    const inactiveClass = isDark ? "text-zinc-400 hover:bg-white/5" : "text-zinc-500 hover:bg-zinc-100";

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r transition-colors duration-300 md:flex ${sidebarBg}`}>
                <div className="flex h-16 items-center px-6">
                    <span className="text-xl font-bold text-emerald-400">MelodyStream</span>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-inherit">
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === "/settings" ? activeClass : inactiveClass}`}
                    >
                        <span className="text-xl">⚙️</span>
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className={`fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t md:hidden transition-colors duration-300 ${sidebarBg}`}>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 transition ${isActive ? "text-emerald-400" : isDark ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                            <span className="text-xl">{link.icon}</span>
                            <span className="text-[10px] uppercase font-bold tracking-tighter">{link.label}</span>
                        </Link>
                    );
                })}
                <Link
                    href="/settings"
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition ${pathname === "/settings" ? "text-emerald-400" : isDark ? "text-zinc-500" : "text-zinc-400"}`}
                >
                    <span className="text-xl">⚙️</span>
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Settings</span>
                </Link>
            </nav>
        </>
    );
}
