import { connectDB } from "@/lib/mongodb";
import Song from "@/models/Song";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const language = searchParams.get("language") ?? "";
    const genre = searchParams.get("genre") ?? "";
    const sort = searchParams.get("sort") ?? "recent"; // recent | trending | topRated

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
        { album: { $regex: search, $options: "i" } },
      ];
    }
    if (language) query.language = language;
    if (genre) query.genre = genre;

    const sortMap: Record<string, Record<string, number>> = {
      recent: { createdAt: -1 },
      trending: { playCount: -1 },
      topRated: { rating: -1 },
    };

    const songs = await Song.find(query).sort(sortMap[sort] ?? { createdAt: -1 });
    return NextResponse.json({ success: true, songs });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch songs" });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const image = formData.get("image") as string;
    const audio = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "Other";
    const genre = (formData.get("genre") as string) || "Other";
    const album = (formData.get("album") as string) || "";

    if (!audio) {
      return NextResponse.json({ success: false, message: "Audio file is required" });
    }

    const bytes = await audio.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = randomUUID() + "-" + audio.name;
    const uploadPath = path.join(process.cwd(), "public", "uploads", "audio", fileName);
    await fs.writeFile(uploadPath, buffer);

    const song = await Song.create({
      title, artist, image, album, language, genre,
      audio: "/uploads/audio/" + fileName,
    });

    // Notify all users
    const users = await User.find().select("email");
    if (users.length > 0) {
      await Notification.insertMany(users.map((u) => ({
        userEmail: u.email,
        type: "new_song",
        message: `New song added: "${title}" by ${artist}`,
        songId: song._id,
      })));
    }

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: "Song upload failed" });
  }
}
