import { connectDB } from "@/lib/mongodb";
import Playlist from "@/models/Playlist";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: false });

    const playlists = await Playlist.find({ user: user._id }).populate("songs");
    return NextResponse.json({ success: true, playlists });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, name, description, image } = await req.json();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: false });

    const playlist = await Playlist.create({ name, description, image, user: user._id });
    user.playlists.push(playlist._id);
    await user.save();

    return NextResponse.json({ success: true, playlist });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
