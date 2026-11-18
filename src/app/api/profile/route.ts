import { NextResponse } from "next/server";
import { connectDatabase, User } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await connectDatabase();
  const profile = await User.findById(user.id).select("name email profession createdAt").lean();
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json() as { profession?: string; name?: string };
  const profession = body.profession?.trim();
  const name = body.name?.trim();

  if (name) {
    await User.findByIdAndUpdate(user.id, { name });
  }
  if (profession) {
    await User.findByIdAndUpdate(user.id, { profession });
  }

  return NextResponse.json({ ok: true });
}
