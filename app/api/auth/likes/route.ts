import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId, songId } = await req.json();

        const existing = await prisma.likedSong.findUnique({
            where: {
                userId_songId: { userId, songId },
            },
        });

        if (existing) {
            await prisma.likedSong.delete({
                where: {
                    userId_songId: { userId, songId },
                },
            });
            return NextResponse.json({ success: true, liked: false });
        } else {
            await prisma.likedSong.create({
                data: { userId, songId },
            });
            return NextResponse.json({ success: true, liked: true });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ success: false });

    const likes = await prisma.likedSong.findMany({
        where: { userId },
        select: { songId: true },
    });

    return NextResponse.json({ success: true, likedSongIds: likes.map((l: { songId: string }) => l.songId) });
}
