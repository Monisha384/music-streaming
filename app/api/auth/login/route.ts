import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const ADMIN_EMAIL = "admin@musicverse.com";
const ADMIN_PASSWORD = "admin123";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        user: { email, role: "admin" },
      });
    }

    await connectDB();

    const user = await User.findOne({ email, password });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Login Failed",
    });
  }
}