import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ success: false });
  await connectDB();
  const user = await User.findOne({ email })
    .populate("favorites")
    .populate("playlists.songs")
    .populate("recentlyPlayed.song");
  if (!user) return NextResponse.json({ success: false, message: "User not found" });
  return NextResponse.json({ success: true, user });
}

export async function PUT(req: Request) {
  const { email, name, bio, avatar, favoriteArtists } = await req.json();
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email },
    { ...(name && { name }), ...(bio !== undefined && { bio }), ...(avatar && { avatar }), ...(favoriteArtists && { favoriteArtists }) },
    { new: true }
  );
  return NextResponse.json({ success: true, user });
}
