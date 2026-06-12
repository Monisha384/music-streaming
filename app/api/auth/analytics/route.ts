import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    const songCount = await Song.countDocuments();
    const totalPlays = await Song.aggregate([{ $group: { _id: null, total: { $sum: "$playCount" } } }]);

    return NextResponse.json({
      success: true,
      stats: {
        users: userCount,
        songs: songCount,
        plays: totalPlays[0]?.total || 0,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
