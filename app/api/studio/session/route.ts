import { NextRequest, NextResponse } from "next/server";
import {
  createStudioSessionToken,
  getStudioSessionMaxAge,
  STUDIO_SESSION_COOKIE,
  verifyAdminToken,
  verifyStudioSession,
} from "@/lib/studio-auth";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const LOGIN_RATE_LIMIT = 5;
const LOGIN_WINDOW_MS = 60 * 1000;

function clearCookie(response: NextResponse) {
  response.cookies.set({
    name: STUDIO_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STUDIO_SESSION_COOKIE)?.value;
  return NextResponse.json({ authenticated: await verifyStudioSession(session) });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip, LOGIN_RATE_LIMIT, LOGIN_WINDOW_MS, "login")) {
    return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { token?: unknown };
    const provided = typeof body.token === "string" ? body.token : null;

    if (!(await verifyAdminToken(provided))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: STUDIO_SESSION_COOKIE,
      value: await createStudioSessionToken(),
      maxAge: getStudioSessionMaxAge(),
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearCookie(response);
  return response;
}
