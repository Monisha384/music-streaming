import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

// POST /api/auth/songs/play  { songId }
export async function POST(req: Request) {
  const { songId } = await req.json();
  await connectDB();
  await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });
  return NextResponse.json({ success: true });
}
