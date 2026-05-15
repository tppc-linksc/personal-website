import { NextRequest, NextResponse } from "next/server";
import { moderateMessage } from "@/lib/messages-source";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authorized = await isStudioAuthorized({
    tokenHeader: request.headers.get("x-studio-token"),
    sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
  });

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: unknown };
  const status = body.status;
  if (status !== "approved" && status !== "hidden") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await moderateMessage(id, status);
  return NextResponse.json({ ok: true });
}
