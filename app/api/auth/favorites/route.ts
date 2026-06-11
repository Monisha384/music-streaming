import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/auth/favorites?email=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ success: false, message: "Email required" });

  await connectDB();
  const user = await User.findOne({ email }).populate("favorites");
  return NextResponse.json({ success: true, favorites: user?.favorites ?? [] });
}

// POST /api/auth/favorites  { email, songId }
export async function POST(req: Request) {
  const { email, songId } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });

  const alreadyLiked = user.favorites.includes(songId);
  if (alreadyLiked) {
    user.favorites = user.favorites.filter((id: string) => id.toString() !== songId);
  } else {
    user.favorites.push(songId);
  }

  await user.save();
  return NextResponse.json({ success: true, liked: !alreadyLiked, favorites: user.favorites });
}
