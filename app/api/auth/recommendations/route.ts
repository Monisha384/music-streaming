import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import User from "@/models/User";
import { NextResponse } from "next/server";

const MOOD_GENRE_MAP: Record<string, string[]> = {
  happy: ["Pop", "Folk", "Mass"],
  sad: ["Melody", "Romantic", "Classical"],
  relax: ["Classical", "Melody", "Romantic"],
  workout: ["Mass", "Rock", "Pop"],
  party: ["Pop", "Mass", "Folk"],
  romantic: ["Romantic", "Melody", "Classical"],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const mood = searchParams.get("mood");
  const songId = searchParams.get("songId");
  await connectDB();

  if (mood && MOOD_GENRE_MAP[mood.toLowerCase()]) {
    const songs = await Song.find({ genre: { $in: MOOD_GENRE_MAP[mood.toLowerCase()] } }).sort({ playCount: -1 }).limit(8);
    return NextResponse.json({ success: true, songs, type: "mood" });
  }

  if (songId) {
    const song = await Song.findById(songId);
    if (song) {
      const songs = await Song.find({ _id: { $ne: songId }, $or: [{ artist: song.artist }, { genre: song.genre }] }).sort({ playCount: -1 }).limit(8);
      return NextResponse.json({ success: true, songs, type: "similar" });
    }
  }

  if (email) {
    const user = await User.findOne({ email }).populate("recentlyPlayed.song");
    if (user?.recentlyPlayed?.length) {
      const recentSongs = user.recentlyPlayed.slice(-10).map((r: { song: { genre?: string; artist?: string; _id?: string } }) => r.song).filter(Boolean);
      const genres = [...new Set(recentSongs.map((s: { genre?: string }) => s?.genre).filter(Boolean))];
      const artists = [...new Set(recentSongs.map((s: { artist?: string }) => s?.artist).filter(Boolean))];
      const playedIds = user.recentlyPlayed.map((r: { song: { _id: string } }) => r.song?._id).filter(Boolean);
      const songs = await Song.find({ _id: { $nin: playedIds }, $or: [{ genre: { $in: genres } }, { artist: { $in: artists } }] }).sort({ playCount: -1 }).limit(8);
      return NextResponse.json({ success: true, songs, type: "personalized" });
    }
  }

  const songs = await Song.find().sort({ playCount: -1 }).limit(8);
  return NextResponse.json({ success: true, songs, type: "trending" });
}
