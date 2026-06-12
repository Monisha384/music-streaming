import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    // Simplified logic: return trending songs for now
    const recommendations = await Song.find({}).sort({ playCount: -1 }).limit(10);
    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
