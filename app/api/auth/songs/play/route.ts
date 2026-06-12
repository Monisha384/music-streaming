import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, songId } = await req.json();

    if (email) {
      await User.findOneAndUpdate(
        { email },
        {
          $pull: { recentlyPlayed: { song: songId } }
        }
      );
      await User.findOneAndUpdate(
        { email },
        {
          $push: { recentlyPlayed: { $each: [{ song: songId, playedAt: new Date() }], $position: 0, $slice: 20 } }
        }
      );
    }

    await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
