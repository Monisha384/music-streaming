import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return NextResponse.json({ success: true, users });
}
