import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Artist from "@/models/Artist";
import Song from "@/models/Song";
import UploadRequest from "@/models/UploadRequest";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();
        const request = await UploadRequest.create({
            artistName: data.name,
            songTitle: data.songTitle,
            genre: data.genre,
            audioUrl: data.audioLink,
            imageUrl: data.imageLink || "/logo.png",
        });
        return NextResponse.json({ success: true, request });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}

export async function GET() {
    try {
        await connectDB();
        const requests = await UploadRequest.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const { id, action } = await req.json();
        if (action === "approve") {
            const request = await UploadRequest.findByIdAndUpdate(id, { status: "approved" });
            if (request) {
                await Song.create({
                    title: request.songTitle,
                    artistName: request.artistName,
                    audio: request.audioUrl,
                    image: request.imageUrl,
                    genre: request.genre,
                });
            }
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
