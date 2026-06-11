import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/auth/user-playlists?email=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ success: false, message: "Email required" });

  await connectDB();
  const user = await User.findOne({ email }).populate("playlists.songs");
  return NextResponse.json({ success: true, playlists: user?.playlists ?? [] });
}

// POST /api/auth/user-playlists  { email, name }
export async function POST(req: Request) {
  const { email, name } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });

  user.playlists.push({ name, songs: [] });
  await user.save();

  return NextResponse.json({ success: true, playlists: user.playlists });
}
