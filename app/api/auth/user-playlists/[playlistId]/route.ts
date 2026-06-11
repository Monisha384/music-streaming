import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ playlistId: string }> };

// PUT /api/auth/user-playlists/[playlistId]  { email, name?, songId?, action: 'rename'|'addSong'|'removeSong' }
export async function PUT(req: Request, { params }: Params) {
  const { playlistId } = await params;
  const { email, name, songId, action } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });

  const playlist = user.playlists.id(playlistId);
  if (!playlist) return NextResponse.json({ success: false, message: "Playlist not found" });

  if (action === "rename" && name) playlist.name = name;
  if (action === "addSong" && songId && !playlist.songs.includes(songId)) playlist.songs.push(songId);
  if (action === "removeSong" && songId) playlist.songs = playlist.songs.filter((id: string) => id.toString() !== songId);

  await user.save();
  return NextResponse.json({ success: true, playlist });
}

// DELETE /api/auth/user-playlists/[playlistId]?email=...
export async function DELETE(req: Request, { params }: Params) {
  const { playlistId } = await params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });

  user.playlists = user.playlists.filter((p: { _id: { toString: () => string } }) => p._id.toString() !== playlistId);
  await user.save();
  return NextResponse.json({ success: true, playlists: user.playlists });
}
