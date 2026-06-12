"use client";

import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

export default function AdBanner() {
    const { isPremium } = usePlayer();
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isPremium === false) {
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isPremium]);

    if (isPremium || !isVisible) return null;

    return (
        <div className="fixed bottom-24 left-1/2 z-[40] -translate-x-1/2 w-full max-w-xl px-4 animate-bounce">
            <div className={`relative flex items-center justify-between gap-4 rounded-xl border p-4 shadow-2xl ${isDark ? "bg-zinc-900 border-emerald-400/30 text-white" : "bg-white border-emerald-400/30 text-zinc-900"
                }`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400 text-black">
                        <span className="text-xl font-bold">A</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold">Sponsored: Upgrade to Premium</p>
                        <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Enjoy ad-free music, offline listening, and more!</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-zinc-500 hover:text-emerald-400 transition"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
