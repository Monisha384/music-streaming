"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => setIsVisible(false), 800); // Wait for fade animation
        }, 2000); // Show logo for 2 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${isFading ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            <div className="text-center animate-pulse">
                <div className="relative mb-4 inline-block">
                    {/* Logo Icon */}
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_50px_rgba(52,211,153,0.3)]">
                        <span className="text-5xl">🎵</span>
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute -inset-4 animate-[ping_3s_infinite] rounded-full border-2 border-emerald-400/20" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white md:text-5xl">
                    Melody<span className="text-emerald-400">Stream</span>
                </h1>
                <div className="mt-8 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
