import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, name } = await req.json();

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ success: false, message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}