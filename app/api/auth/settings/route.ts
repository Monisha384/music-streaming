import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, settings } = await req.json();
        const user = await User.findOneAndUpdate({ email }, { settings }, { new: true });
        return NextResponse.json({ success: true, settings: user.settings });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
