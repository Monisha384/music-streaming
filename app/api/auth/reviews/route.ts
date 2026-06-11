import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");
  if (!songId) return NextResponse.json({ success: false, message: "songId required" });
  await connectDB();
  const reviews = await Review.find({ song: songId }).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, reviews });
}

export async function POST(req: Request) {
  const { songId, userEmail, userName, rating, comment } = await req.json();
  await connectDB();

  const existing = await Review.findOne({ song: songId, userEmail });
  let review;
  if (existing) {
    existing.rating = rating;
    existing.comment = comment ?? "";
    review = await existing.save();
  } else {
    review = await Review.create({ song: songId, userEmail, userName, rating, comment });
  }

  const reviews = await Review.find({ song: songId });
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  await Song.findByIdAndUpdate(songId, { rating: avg, ratingCount: reviews.length });

  return NextResponse.json({ success: true, review });
}
