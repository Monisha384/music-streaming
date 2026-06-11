import { connectDB } from "@/lib/mongodb";
import Artist from "@/models/Artist";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  await connectDB();
  const artist = await Artist.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ success: true, artist });
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  await connectDB();
  await Artist.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
