import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-24">
        <img
          src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=80"
          alt="Crowd enjoying a live music concert"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">About MelodyStream</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-6xl">
            A music space for Tamil favorites and English hits
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-zinc-200">
            MelodyStream helps listeners explore songs, artists and playlists across two languages. It highlights Tamil composers like Yuvan, Anirudh, A. R. Rahman and Ilayaraja while keeping English pop, rock and acoustic hits easy to find.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/songs" className="rounded-full bg-emerald-400 px-7 py-3 font-semibold text-black hover:bg-emerald-300">
              Browse Songs
            </Link>
            <Link href="/artists" className="rounded-full border border-white/60 px-7 py-3 font-semibold hover:bg-white hover:text-black">
              Meet Artists
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
