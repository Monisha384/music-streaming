import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import User from "@/models/User";
import Artist from "@/models/Artist";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const [totalUsers, totalSongs, totalArtists, allSongs, users] = await Promise.all([
    User.countDocuments(),
    Song.countDocuments(),
    Artist.countDocuments(),
    Song.find().select("playCount genre language title artist"),
    User.find().select("playlists"),
  ]);

  const totalPlaylists = users.reduce((acc, u) => acc + (u.playlists?.length ?? 0), 0);
  const totalPlays = allSongs.reduce((acc, s) => acc + (s.playCount ?? 0), 0);

  const genreMap: Record<string, number> = {};
  const langMap: Record<string, number> = {};
  allSongs.forEach((s) => {
    if (s.genre) genreMap[s.genre] = (genreMap[s.genre] ?? 0) + 1;
    if (s.language) langMap[s.language] = (langMap[s.language] ?? 0) + 1;
  });

  const topSongs = await Song.find().sort({ playCount: -1 }).limit(5);

  return NextResponse.json({
    success: true,
    stats: { totalUsers, totalSongs, totalArtists, totalPlaylists, totalPlays },
    topSongs,
    genreBreakdown: Object.entries(genreMap).map(([genre, count]) => ({ genre, count })),
    languageBreakdown: Object.entries(langMap).map(([language, count]) => ({ language, count })),
  });
}
