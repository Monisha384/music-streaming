import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ success: false, message: "Email required" });

    const user = await User.findOne({ email }).populate("likedSongs");
    const validSongs = (user?.likedSongs || []).filter(Boolean);

    return NextResponse.json({ success: true, favorites: validSongs });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ success: false });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, songId } = await req.json();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: false, message: "User not found" });

    const songIndex = user.likedSongs.findIndex((id: any) => id.toString() === songId);

    if (songIndex > -1) {
      user.likedSongs.splice(songIndex, 1);
    } else {
      user.likedSongs.push(songId);
    }

    await user.save();

    // Return updated list of IDs as strings to sync frontend
    const updatedIds = user.likedSongs.map((id: any) => id.toString());

    return NextResponse.json({
      success: true,
      favorites: updatedIds,
      liked: songIndex === -1
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json({ success: false });
  }
}
