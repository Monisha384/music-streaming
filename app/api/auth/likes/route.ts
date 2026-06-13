import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { userId, songId } = await req.json();

        if (!userId || !songId) {
            return NextResponse.json({ success: false, message: "Missing userId or songId" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        // Toggle like
        const songIndex = user.likedSongs.indexOf(songId);
        let liked = false;

        if (songIndex > -1) {
            // Remove from liked
            user.likedSongs.splice(songIndex, 1);
        } else {
            // Add to liked
            user.likedSongs.push(songId);
            liked = true;
        }

        await user.save();
        return NextResponse.json({ success: true, liked });
    } catch (error) {
        console.error("LIKE ERROR:", error);
        return NextResponse.json({ success: false, message: "Internal server error" });
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ success: false });

        const user = await User.findById(userId).select("likedSongs");
        if (!user) return NextResponse.json({ success: false, message: "User not found" });

        return NextResponse.json({ success: true, likedSongIds: user.likedSongs });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
