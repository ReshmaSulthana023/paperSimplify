import { NextResponse } from "next/server";
import { connectDatabase, Paper, ChatMessage } from "@/lib/db";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const paperId = new URL(request.url).searchParams.get("paperId");
  if (!paperId) {
    return NextResponse.json({ error: "Paper ID is required." }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(paperId)) {
    return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  }

  await connectDatabase();
  const paper = await Paper.findOne({ _id: paperId, userId: user.id }).lean();
  if (!paper) {
    return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  }

  const rows = await ChatMessage.find({ paperId, userId: user.id })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  const messages = rows.map((message) => ({
    id: String(message._id),
    role: message.role,
    text: message.text,
    sources: message.sources,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paperId = String(body.paperId ?? "");
    if (!paperId) {
      return NextResponse.json({ error: "Paper ID is required." }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(paperId)) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    await connectDatabase();
    const paper = await Paper.findOne({ _id: paperId, userId: user.id }).lean();
    if (!paper) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    await ChatMessage.create([
      { paperId, userId: user.id, role: "user", text: String(body.question ?? ""), sources: [] },
      { paperId, userId: user.id, role: "assistant", text: String(body.answer ?? ""), sources: body.sources ?? [] },
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save chat history." }, { status: 500 });
  }
}
