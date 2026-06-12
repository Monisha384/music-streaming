"use client";

import { useTheme } from "@/context/ThemeContext";
import { usePlayer } from "@/context/PlayerContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCollaboration } from "@/context/CollaborationContext";

export default function Settings() {
    const { isDark } = useTheme();
    const { isPremium, setIsPremium } = usePlayer();
    const { roomCode, createRoom, joinRoom, leaveRoom } = useCollaboration();
    const [toggles, setToggles] = useState({
        listeningActivity: true,
        playlistVisibility: "public",
        profileVisibility: "public",
        socialFeatures: true,
    });
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("melodystream-user") || "{}");
        if (user.id) {
            fetch(`/api/auth/settings?userId=${user.id}`)
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.settings) {
                        setToggles({
                            listeningActivity: data.settings.listeningActivity,
                            playlistVisibility: data.settings.playlistVisibility,
                            profileVisibility: data.settings.profileVisibility,
                            socialFeatures: data.settings.socialFeatures,
                        });
                    }
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const handleToggle = async (key: string, value: any) => {
        const user = JSON.parse(localStorage.getItem("melodystream-user") || "{}");
        const nextValue = typeof value === "boolean" ? !value : (value === "public" ? "private" : "public");

        setToggles((prev: any) => ({ ...prev, [key]: nextValue }));

        if (user.id) {
            await fetch("/api/auth/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, [key]: nextValue }),
            });
        }
    };

    const bg = isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900";
    const cardBg = isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200 shadow-sm";
    const sub = isDark ? "text-zinc-400" : "text-zinc-500";
    const hover = isDark ? "hover:bg-white/5" : "hover:bg-zinc-100";

    const handleAddLibrary = async () => {
        const userStr = localStorage.getItem("melodystream-user-info");
        const user = userStr ? JSON.parse(userStr) : {};
        if (!user.email) {
            alert("Please login to manage your library!");
            return;
        }

        // Logic to create a 'Library' playlist if it doesn't exist
        const res = await fetch("/api/auth/user-playlists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, name: "My Library" }),
        });
        const d = await res.json();
        if (d.success) {
            alert("Library playlist initialized! You can now add songs to it.");
        } else {
            alert("Library already setup or error occurred.");
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        const success = await joinRoom(joinCode.trim());
        if (success) {
            alert("Joined session successfully!");
            setJoinCode("");
        } else {
            alert("Invalid or expired code.");
        }
    };

    const handleDownload = async () => {
        if (!isPremium) {
            alert("Upgrade to Premium to download songs!");
            return;
        }
        const user = JSON.parse(localStorage.getItem("melodystream-user") || "{}");
        if (user.id) {
            alert("Download started...");
        }
    };

    const SettingItem = ({ title, description, icon, onClick, action }: any) => (
        <div
            onClick={onClick}
            className={`flex cursor-pointer items-center justify-between gap-4 border-b p-4 last:border-none transition ${hover} ${isDark ? "border-white/5" : "border-zinc-100"}`}
        >
            <div className="flex items-center gap-4">
                <span className="text-2xl">{icon}</span>
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className={`text-xs ${sub}`}>{description}</p>
                </div>
            </div>
            {action}
        </div>
    );

    const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
        <div
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ${active ? "bg-emerald-400" : "bg-zinc-600"}`}
        >
            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-300 ${active ? "left-6" : "left-1"}`} />
        </div>
    );

    return (
        <main className={`min-h-screen pt-20 pb-32 ${bg}`}>
            <div className="mx-auto max-w-2xl px-6">
                <h1 className="mb-8 text-4xl font-black">Settings</h1>

                <div className={`overflow-hidden rounded-2xl border ${cardBg}`}>
                    {/* General */}
                    <div className="p-4 border-b border-inherit">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">General</h2>
                    </div>
                    <SettingItem
                        icon="🔗"
                        title="Share App"
                        description="Spread the word about MelodyStream"
                        onClick={() => navigator.share?.({ title: "MelodyStream", url: window.location.origin })}
                    />
                    <SettingItem
                        icon="📚"
                        title="Add to Library"
                        description="Directly manage your saved tracks"
                        onClick={handleAddLibrary}
                    />
                    <div className="p-4 border-b border-inherit bg-emerald-400/5">
                        <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Active Session</p>
                        {roomCode ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-mono font-bold tracking-widest">{roomCode}</p>
                                    <p className="text-[10px] opacity-60">Share this code with your partner/friend</p>
                                </div>
                                <button onClick={leaveRoom} className="text-xs text-red-400 font-bold hover:underline">LEAVE</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER CODE..."
                                    className="bg-transparent border border-white/10 rounded px-3 py-1.5 text-xs font-mono flex-1 focus:border-emerald-400 outline-none"
                                />
                                <button onClick={handleJoin} className="bg-emerald-400 text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-emerald-300">JOIN</button>
                            </div>
                        )}
                    </div>
                    <SettingItem
                        icon="💎"
                        title="Download"
                        description="Offline listening (Premium)"
                        onClick={handleDownload}
                        action={!isPremium && <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-400">UPGRADE</span>}
                    />
                    <SettingItem
                        icon="🚩"
                        title="Report"
                        description="Report an issue or inappropriate content"
                    />

                    {/* Social & Privacy */}
                    <div className="p-4 border-b border-inherit mt-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Social & Privacy</h2>
                    </div>
                    <SettingItem
                        icon="👥"
                        title="Friend Collaboration Code"
                        description="Generate a code to listen with friends"
                        action={<button onClick={() => createRoom("friend")} className="text-xs font-bold text-emerald-400 hover:underline">GENERATE</button>}
                    />
                    <SettingItem
                        icon="❤️"
                        title="Couple Collaboration Code"
                        description="Sync your beats with your partner"
                        action={<button onClick={() => createRoom("couple")} className="text-xs font-bold text-emerald-400 hover:underline">GENERATE</button>}
                    />
                    <SettingItem
                        icon="🎧"
                        title="Listening Activity"
                        description="Share what you are listening to"
                        action={<Toggle active={toggles.listeningActivity} onToggle={() => handleToggle("listeningActivity", toggles.listeningActivity)} />}
                    />
                    <SettingItem
                        icon="📜"
                        title="Playlist Visibility"
                        description="Make your playlists public or private"
                        action={<Toggle active={toggles.playlistVisibility === "public"} onToggle={() => handleToggle("playlistVisibility", toggles.playlistVisibility)} />}
                    />
                    <SettingItem
                        icon="👤"
                        title="Profile Visibility"
                        description="Hide profile from search"
                        action={<Toggle active={toggles.profileVisibility === "public"} onToggle={() => handleToggle("profileVisibility", toggles.profileVisibility)} />}
                    />
                    <SettingItem
                        icon="🤝"
                        title="Social Features"
                        description="Enable friend & couple collaboration"
                        action={<Toggle active={toggles.socialFeatures} onToggle={() => handleToggle("socialFeatures", toggles.socialFeatures)} />}
                    />
                </div>

                <div className="mt-12 text-center">
                    <p className={sub}>Version 2.0.0-beta</p>
                    <p className="mt-1 text-xs opacity-50">© 2026 MelodyStream Inc.</p>
                </div>
            </div>
        </main>
    );
}
