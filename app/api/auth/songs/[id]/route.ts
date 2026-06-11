import connectDB  from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const body = await req.json();
  const { id } = await params;

  const updatedSong = await Song.findByIdAndUpdate(
    id,
    body,
    { new: true }
  );

  return NextResponse.json(updatedSong);
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  await Song.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "Song Deleted",
  });
}