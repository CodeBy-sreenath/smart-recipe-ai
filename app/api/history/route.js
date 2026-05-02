import { NextResponse } from "next/server";
//import connectDB from "@/lib/mongodb";
import RecipeHistory from "@/models/RecipeHistory";
import connectDB from "@/app/bck_lib/mongodb";

export async function GET(req) {
  await connectDB()
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "guest";

  const history = await RecipeHistory
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return NextResponse.json({ history });
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "guest";

  await RecipeHistory.deleteMany({ userId });
  return NextResponse.json({ success: true });
}