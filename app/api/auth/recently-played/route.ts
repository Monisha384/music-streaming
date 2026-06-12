import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const user = await User.findOne({ email }).populate({
      path: "recentlyPlayed.song",
      model: "Song"
    });

    return NextResponse.json({ success: true, history: user?.recentlyPlayed || [] });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
