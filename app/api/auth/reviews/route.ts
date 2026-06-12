import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, songId, rating, comment } = await req.json();
    const review = await Review.findOneAndUpdate(
      { user: userId, song: songId },
      { rating, comment },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");
    await connectDB();
    const reviews = await Review.find({ song: songId }).populate("user", "name");
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
