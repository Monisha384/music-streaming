import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    // Static notifications for now as requested
    const notifications = [
      { id: "1", title: "Welcome!", message: "Enjoy MelodyStream.", type: "system", createdAt: new Date() },
    ];

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
