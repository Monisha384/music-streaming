import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ success: false });
  await connectDB();
  const notifications = await Notification.find({ userEmail: email }).sort({ createdAt: -1 }).limit(20);
  const unread = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ success: true, notifications, unread });
}

export async function PUT(req: Request) {
  const { email } = await req.json();
  await connectDB();
  await Notification.updateMany({ userEmail: email }, { read: true });
  return NextResponse.json({ success: true });
}
