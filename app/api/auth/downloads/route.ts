import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { userId, songId } = await req.json();
        if (!userId || !songId) return NextResponse.json({ success: false });

        const user = await User.findById(userId);
        if (!user || !user.isPremium) {
            return NextResponse.json({ success: false, message: "Premium required" });
        }

        return NextResponse.json({ success: true, message: "Download authorized" });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
