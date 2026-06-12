"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ArtistRequest() {
    const { isDark } = useTheme();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        songTitle: "",
        genre: "Pop",
        audioLink: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulation: Save to DB
        setSubmitted(true);
    };

    const bg = isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900";
    const cardBg = isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200 shadow-sm";
    const inputBg = isDark ? "bg-zinc-800 border-white/10" : "bg-zinc-100 border-zinc-200";

    if (submitted) {
        return (
            <main className={`flex min-h-screen items-center justify-center ${bg}`}>
                <div className="text-center">
                    <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-black">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h1 className="text-3xl font-bold">Request Submitted!</h1>
                    <p className="mt-2 opacity-70">Admin will review your music shortly. Check your email for updates.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-8 rounded-full bg-emerald-400 px-8 py-3 font-bold text-black hover:bg-emerald-300">
                        Submit Another
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={`min-h-screen pt-24 pb-32 ${bg}`}>
            <div className="mx-auto max-w-xl px-6">
                <h1 className="text-4xl font-black">Artist Hub</h1>
                <p className="mt-2 mb-10 opacity-70">Submit your masterpiece to be featured on MelodyStream.</p>

                <form onSubmit={handleSubmit} className={`rounded-2xl border p-8 ${cardBg}`}>
                    <div className="grid gap-6">
                        <div>
                            <label className="mb-2 block text-sm font-bold opacity-80">Artist Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full rounded-xl p-3 outline-none ring-1 ring-transparent focus:ring-emerald-400 ${inputBg}`}
                                placeholder="e.g. Yuvan Shankar Raja"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold opacity-80">Contact Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full rounded-xl p-3 outline-none ring-1 ring-transparent focus:ring-emerald-400 ${inputBg}`}
                                placeholder="artist@example.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold opacity-80">Song Title</label>
                            <input
                                required
                                value={formData.songTitle}
                                onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                                className={`w-full rounded-xl p-3 outline-none ring-1 ring-transparent focus:ring-emerald-400 ${inputBg}`}
                                placeholder="Your song name"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold opacity-80">Genre</label>
                            <select
                                value={formData.genre}
                                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                className={`w-full rounded-xl p-3 outline-none ring-1 ring-transparent focus:ring-emerald-400 ${inputBg}`}
                            >
                                <option>Pop</option>
                                <option>Rock</option>
                                <option>Melody</option>
                                <option>Folk</option>
                                <option>Classical</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold opacity-80">Audio File URL</label>
                            <input
                                required
                                type="url"
                                value={formData.audioLink}
                                onChange={(e) => setFormData({ ...formData, audioLink: e.target.value })}
                                className={`w-full rounded-xl p-3 outline-none ring-1 ring-transparent focus:ring-emerald-400 ${inputBg}`}
                                placeholder="Link to your MP3 file"
                            />
                        </div>
                        <button className="mt-4 rounded-xl bg-emerald-400 py-4 font-bold text-black transition hover:bg-emerald-300 active:scale-95">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
