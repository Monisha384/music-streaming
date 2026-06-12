import { connectDB } from "@/lib/mongodb";
import FriendSession from "@/models/FriendSession";
import { NextResponse } from "next/server";

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { userId, type } = await req.json();

        const code = generateCode();
        const session = await FriendSession.create({
            sessionCode: code,
            host: userId,
            status: "active",
            expiresAt: new Date(Date.now() + 3 * 3600000), // 3 hours
        });

        return NextResponse.json({ success: true, code, session });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const { code, userId } = await req.json();
        const session = await FriendSession.findOne({ sessionCode: code, status: "active" });

        if (!session) {
            return NextResponse.json({ success: false, message: "Session not found" });
        }

        // In a more complex app, we'd add the user to a 'guests' array
        return NextResponse.json({ success: true, session });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        await connectDB();
        const session = await FriendSession.findOne({ sessionCode: code, status: "active" });
        if (!session || session.expiresAt < new Date()) {
            return NextResponse.json({ success: false, message: "Invalid or expired code" });
        }
        return NextResponse.json({ success: true, session });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
