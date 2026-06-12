import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");

    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { artistName: { $regex: search, $options: "i" } },
        { album: { $regex: search, $options: "i" } },
      ];
    }

    let songs = Song.find(query);
    if (sort === "trending") songs = songs.sort({ playCount: -1 });
    if (sort === "recent") songs = songs.sort({ createdAt: -1 });

    const result = await songs.limit(50);
    const mapped = result.map(s => {
      const obj = s.toObject();
      return { ...obj, artist: obj.artistName };
    });
    return NextResponse.json({ success: true, songs: mapped });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
