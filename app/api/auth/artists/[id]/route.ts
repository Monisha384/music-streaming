import { connectDB } from "@/lib/mongodb";
import Artist from "@/models/Artist";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const artist = await Artist.findById(params.id);
    return NextResponse.json({ success: true, artist });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
