"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("melodystream-user") === "true") {
      router.push("/songs");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.message || "Registration failed");
      return;
    }
    localStorage.setItem("melodystream-user", "true");
    window.dispatchEvent(new Event("storage"));
    router.push("/songs");
  }

  return (
    <main className="grid min-h-screen bg-black text-white md:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-zinc-900 p-8">
          <h1 className="text-center text-4xl font-bold">Create Account</h1>
          <p className="mt-3 text-center text-zinc-400">Register to access your music pages.</p>

          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

          <input type="text" name="name" required placeholder="Full Name" className="mt-8 w-full rounded bg-zinc-800 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-emerald-300" />
          <input type="email" name="email" required placeholder="Email" className="mt-4 w-full rounded bg-zinc-800 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-emerald-300" />
          <input type="password" name="password" required placeholder="Password" className="mt-4 w-full rounded bg-zinc-800 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-emerald-300" />

          <button type="submit" disabled={loading} className="mt-6 w-full rounded bg-emerald-400 p-3 font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already registered? <Link href="/login" className="font-semibold text-emerald-300">Login</Link>
          </p>
        </form>
      </section>

      <section className="relative hidden overflow-hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=1200&q=80"
          alt="DJ controller"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-black" />
      </section>
    </main>
  );
}
