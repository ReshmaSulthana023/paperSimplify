import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDatabase, User } from "@/lib/db";

const SESSION_COOKIE = "paper_explainer_session";
const secret = process.env.AUTH_SECRET ?? "development-only-change-this-secret";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

function sign(value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload = `${userId}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  const userId = parts[0];
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return null;
  }
  await connectDatabase();
  const user = await User.findById(userId).select("name email").lean();
  if (!user) {
    return null;
  }
  return {
    id: String(user._id),
    name: String(user.name),
    email: String(user.email),
  };
}

export async function setSessionToken(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
