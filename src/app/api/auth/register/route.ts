import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDatabase, User } from "@/lib/db";
import { createSessionToken, setSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; email?: string; password?: string };
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        { error: "Name, email, and a password of at least 8 characters are required." },
        { status: 400 },
      );
    }

    await connectDatabase();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    await setSessionToken(createSessionToken(String(user._id)));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ECONNREFUSED") || message.includes("ServerSelection")) {
      return NextResponse.json(
        { error: "MongoDB is unavailable. Start the MongoDB service and try again." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
