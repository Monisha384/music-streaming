import { connectDB } from "@/lib/mongodb";
import Artist from "@/models/Artist";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const artists = await Artist.find().sort({ name: 1 });
  return NextResponse.json({ success: true, artists });
}

export async function POST(req: Request) {
  const body = await req.json();
  await connectDB();
  const artist = await Artist.create(body);
  return NextResponse.json({ success: true, artist });
}
