import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getContent, setContent } from "@/lib/site-content";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";
import type { SiteContent } from "@/lib/site-content-types";

async function ensureAdmin(request: NextRequest): Promise<boolean> {
  return isStudioAuthorized({
    tokenHeader: request.headers.get("x-studio-token"),
    sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
  });
}

export async function GET() {
  return NextResponse.json({ content: getContent() });
}

export async function POST(request: NextRequest) {
  if (!(await ensureAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    if (!body.content || typeof body.content !== "object") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    setContent(body.content as SiteContent);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
