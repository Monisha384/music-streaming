"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, FormEvent } from "react";

interface Song {
  _id: string;
  title: string;
  artist: string;
  image?: string;
  audio?: string;
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem("melodystream-admin") === "true",
    () => false
  );

  const [songs, setSongs] = useState<Song[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const [artistRequests, setArtistRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/auth/songs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSongs(d.songs); });

    fetch("/api/auth/artists/request")
      .then((r) => r.json())
      .then((d) => { if (d.success) setArtistRequests(d.requests); });
  }, [isAdmin]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setUploading(true);

    try {
      const url = editingSong ? `/api/auth/songs/${editingSong._id}` : "/api/auth/songs";
      const method = editingSong ? "PUT" : "POST";

      let body: any;
      if (editingSong) {
        const formData = new FormData(form);
        body = JSON.stringify(Object.fromEntries(formData.entries()));
      } else {
        body = new FormData(form);
      }

      const res = await fetch(url, {
        method,
        body,
        headers: editingSong ? { "Content-Type": "application/json" } : undefined,
      });

      const data = await res.json();
      setUploading(false);

      if (!data.success) {
        setError(data.message || "Action failed");
        return;
      }
console.log(editingSong);
      if (editingSong) {
        setSongs((prev) => prev.map((s) => (s._id === data.song._id ? data.song : s)));
        setEditingSong(null);
      } else {
        setSongs((prev) => [data.song, ...prev]);
      }
      form.reset();
    } catch {
      setUploading(false);
      setError("Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/auth/songs/${id}`, { method: "DELETE" });
    setSongs((prev) => prev.filter((s) => s._id !== id));
  }

  function handleLogout() {
    localStorage.removeItem("melodystream-admin");
    localStorage.removeItem("melodystream-user");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Checking admin access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-200">Admin panel</p>
            <h1 className="mt-3 text-5xl font-bold">MelodyStream Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="rounded-full border border-white/20 px-5 py-3 font-semibold transition hover:border-red-400 hover:text-red-400">
            Logout
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleUpload} className="rounded-lg bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingSong ? "Edit Song" : "Upload Song"}</h2>
              {editingSong && (
                <button onClick={() => setEditingSong(null)} type="button" className="text-xs text-zinc-400 hover:text-white">CANCEL</button>
              )}
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <input name="title" defaultValue={editingSong?.title || ""} required placeholder="Song title" className="mt-6 w-full rounded bg-zinc-800 p-3 outline-none ring-1 ring-white/10 focus:ring-amber-200" />
            <input name="artist" defaultValue={editingSong?.artist || ""} required placeholder="Artist name" className="mt-4 w-full rounded bg-zinc-800 p-3 outline-none ring-1 ring-white/10 focus:ring-amber-200" />
            <input name="image" defaultValue={editingSong?.image || ""} placeholder="Image URL" className="mt-4 w-full rounded bg-zinc-800 p-3 outline-none ring-1 ring-white/10 focus:ring-amber-200" />
            <input name="album" defaultValue={(editingSong as any)?.album || ""} placeholder="Album (optional)" className="mt-4 w-full rounded bg-zinc-800 p-3 outline-none ring-1 ring-white/10 focus:ring-amber-200" />
            <select name="language" defaultValue={(editingSong as any)?.language || "Tamil"} className="mt-4 w-full rounded bg-zinc-800 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-amber-200">
              {["Tamil", "English", "Hindi", "Telugu", "Malayalam", "Other"].map((l) => <option key={l}>{l}</option>)}
            </select>
            <select name="genre" defaultValue={(editingSong as any)?.genre || "Melody"} className="mt-4 w-full rounded bg-zinc-800 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-amber-200">
              {["Melody", "Folk", "Pop", "Rock", "Classical", "Mass", "Romantic", "Other"].map((g) => <option key={g}>{g}</option>)}
            </select>
            {!editingSong && (
              <input type="file" name="audio" accept=".mp3,audio/*" required className="mt-4 w-full rounded bg-zinc-800 p-3" />
            )}
            <button type="submit" disabled={uploading} className="mt-6 w-full rounded bg-amber-300 p-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-50">
              {uploading ? (editingSong ? "Saving..." : "Uploading...") : (editingSong ? "Update Song" : "Add Song")}
            </button>
          </form>

          <section className="rounded-lg bg-zinc-900 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold">Uploaded Songs</h2>
              <Link href="/songs" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
                View public songs
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {songs.length === 0 && <p className="text-zinc-400">No songs yet.</p>}
              {songs.map((song) => (
                <div key={song._id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-4">
                  <div>
                    <p className="text-lg font-semibold">{song.title}</p>
                    <p className="text-zinc-400">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingSong(song)} className="rounded px-3 py-1 text-sm text-amber-200 hover:bg-amber-200/10">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(song._id)} className="rounded px-3 py-1 text-sm text-red-400 hover:bg-red-400/10">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Artist Requests Section */}
          <section className="rounded-lg bg-zinc-900 p-6 lg:ml-8 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Artist Music Import Requests</h2>
            <div className="grid gap-4">
              {artistRequests.length === 0 && <p className="text-zinc-400">No pending requests.</p>}
              {artistRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-4">
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded bg-zinc-800 flex items-center justify-center text-xl">🎵</div>
                    <div>
                      <p className="text-lg font-semibold">"{req.songTitle}" - Artist: {req.artistName}</p>
                      <p className="text-xs text-zinc-400">Status: {req.status} • Genre: {req.genre}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={async () => {
                            await fetch("/api/auth/artists/request", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: req.id, action: "approve" }),
                            });
                            // Refresh
                            window.location.reload();
                          }}
                          className="rounded px-4 py-2 text-sm bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition"
                        >
                          Approve
                        </button>
                        <button className="rounded px-4 py-2 text-sm border border-red-400 text-red-400 font-bold hover:bg-red-400/10 transition">Reject</button>
                      </>
                    )}
                    {req.status === "approved" && <span className="text-emerald-400 font-bold">Approved</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
