import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectDB();
    const song = await Song.findById(params.id);
    return NextResponse.json({ success: true, song });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectDB();
    await Song.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await req.json();
    await connectDB();

    const updatedSong = await Song.findByIdAndUpdate(params.id, {
      title: body.title,
      artistName: body.artist,
      album: body.album,
      genre: body.genre,
      language: body.language,
      image: body.image,
    }, { new: true });

    return NextResponse.json({ success: true, song: updatedSong });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}