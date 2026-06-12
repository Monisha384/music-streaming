import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

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

export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const image = formData.get("image") as string;
    const album = formData.get("album") as string;
    const language = formData.get("language") as string;
    const genre = formData.get("genre") as string;
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ success: false, message: "No audio file uploaded" });
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${audioFile.name}`;
    const path = join(process.cwd(), "public", "songs", fileName);
    await writeFile(path, buffer);

    const song = await Song.create({
      title,
      artistName: artist,
      image: image || "/logo.png",
      album,
      language,
      genre,
      audio: `/songs/${fileName}`,
    });

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" });
  }
}
