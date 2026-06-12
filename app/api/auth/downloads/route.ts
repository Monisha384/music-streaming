import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId, songId } = await req.json();
        if (!userId || !songId) return NextResponse.json({ success: false });

        // In a real app, check if user is premium again
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isPremium) {
            return NextResponse.json({ success: false, message: "Premium required" });
        }

        // Log download (simulation)
        // We don't have a direct field for "downloads" but we can use notifications or just return success
        return NextResponse.json({ success: true, message: "Download authorized" });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
