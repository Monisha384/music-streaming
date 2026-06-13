import { connectDB } from "@/lib/mongodb";
import Artist from "@/models/Artist";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const artist = await Artist.findById(id);
    return NextResponse.json({ success: true, artist });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
