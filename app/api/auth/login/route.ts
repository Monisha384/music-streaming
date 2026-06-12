import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: false, message: "Invalid credentials" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const role = user.role || "user";
    console.log(`LOGIN: email=${user.email}, role=${role}, dbRole=${user.role}`);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        role
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}