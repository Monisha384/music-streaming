import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const song = await Song.findById(params.id);
    return NextResponse.json({ success: true, song });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}