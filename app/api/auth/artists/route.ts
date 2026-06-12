import { connectDB } from "@/lib/mongodb";
import Artist from "@/models/Artist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const artists = await Artist.find({});
    return NextResponse.json({ success: true, artists });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
