import { NextResponse } from "next/server";
import { connectDatabase, Paper } from "@/lib/db";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  }
  await connectDatabase();
  const paper = await Paper.findOne({ _id: id, userId: user.id }).lean();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  }

  return NextResponse.json({ paper });
}
