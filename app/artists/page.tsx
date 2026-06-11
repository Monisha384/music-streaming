import Link from "next/link";

interface Artist {
  name: string;
  language: string;
  style: string;
  image: string;
}

const artists: Artist[] = [
  { name: "Yuvan Shankar Raja", language: "Tamil", style: "Youthful melody and dance hits", image: "https://i.pinimg.com/736x/d6/46/f1/d646f139d9ecc7a21930ca7ed96d13e9.jpg" },
  { name: "Anirudh Ravichander", language: "Tamil", style: "Mass hooks and energetic beats", image: "https://i.pinimg.com/736x/dd/c9/ab/ddc9ab7eb0f6ce83d3bf6f61e1ac09b2.jpg" },
  { name: "A. R. Rahman", language: "Tamil", style: "Cinematic orchestral sound", image: "https://m.media-amazon.com/images/I/61hSmslpkjL._AC_UF894,1000_QL80_.jpg" },
  { name: "Ilayaraja", language: "Tamil", style: "Evergreen classics and folk soul", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6D1GzLMc6ONmfSxp3TdZ8fSrzNuQJsO0QyQ&s" },
  { name: "Suriyavelan", language: "Tamil", style: "Traditional folk music", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtwvvjONRlvgPRxo42Sos0s82TFFNd3hxXMQ&s" },
  { name: "Karthi", language: "Tamil", style: "Actor soundtrack favorites", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNmjkdULf4Dy6MXJKmOvfwVy3kgN4t2bzdRg&s" },
  { name: "The Weeknd", language: "English", style: "Night-drive pop and R&B", image: "https://s.yimg.com/ny/api/res/1.2/VR89fDq1nY6gYyF1Ooejgw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyNDI7aD04Mjg7Y2Y9d2VicA--/https://media.zenfs.com/en/billboard_547/4e4f00db1ff24daed58088bc84535cde" },
  { name: "Taylor Swift", language: "English", style: "Storytelling pop", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80" },
  { name: "Ed Sheeran", language: "English", style: "Acoustic romance", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80" },
  { name: "Dua Lipa", language: "English", style: "Disco pop energy", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80" },
];

export default function Artists() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">Artist collection</p>
        <h1 className="mt-3 text-5xl font-bold">Top Tamil and English Artists</h1>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {artists.map((artist) => (
            <Link key={artist.name} href="/songs" className="rounded-lg bg-zinc-900 p-6 text-left transition hover:-translate-y-1 hover:bg-zinc-800">
              <div className="overflow-hidden rounded-xl">
                <img src={artist.image} alt={artist.name} className="mb-5 h-80 w-full rounded-lg object-contain bg-black" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">{artist.language}</span>
              <h2 className="mt-2 text-2xl font-semibold">{artist.name}</h2>
              <p className="mt-2 text-zinc-400">{artist.style}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
