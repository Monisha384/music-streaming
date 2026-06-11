import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/auth/recently-played?email=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ success: false, message: "Email required" });

  await connectDB();
  const user = await User.findOne({ email }).populate("recentlyPlayed.song");
  const history = (user?.recentlyPlayed ?? []).slice(-20).reverse();
  return NextResponse.json({ success: true, history });
}

// POST /api/auth/recently-played  { email, songId }
export async function POST(req: Request) {
  const { email, songId } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });

  // Remove existing entry for same song to avoid duplicates
  user.recentlyPlayed = user.recentlyPlayed.filter(
    (entry: { song: { toString: () => string } }) => entry.song.toString() !== songId
  );
  user.recentlyPlayed.push({ song: songId, playedAt: new Date() });

  // Keep max 50 entries
  if (user.recentlyPlayed.length > 50) user.recentlyPlayed = user.recentlyPlayed.slice(-50);

  await user.save();
  return NextResponse.json({ success: true });
}
