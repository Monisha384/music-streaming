import { connectDB } from "@/lib/mongodb";
import Playlist from "@/models/Playlist";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  try {
    const { playlistId } = await params;
    await connectDB();
    const playlist = await Playlist.findById(playlistId).populate("songs");
    return NextResponse.json({ success: true, playlist });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  try {
    const { playlistId } = await params;
    await connectDB();
    const { songId, action } = await req.json();
    const playlist = await Playlist.findById(playlistId);

    if (action === "add") {
      if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
    } else {
      playlist.songs = playlist.songs.filter((id: any) => id.toString() !== songId);
    }
    await playlist.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  try {
    const { playlistId } = await params;
    await connectDB();
    await Playlist.findByIdAndDelete(playlistId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
