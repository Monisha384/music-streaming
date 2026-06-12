import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
