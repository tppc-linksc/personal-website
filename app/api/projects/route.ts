import { NextRequest, NextResponse } from "next/server";
import { getAllProjects } from "@/lib/projects-source";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function ensureAdmin(request: NextRequest): Promise<boolean> {
  return isStudioAuthorized({
    tokenHeader: request.headers.get("x-studio-token"),
    sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
  });
}

export async function GET(request: NextRequest) {
  try {
    const includeDraft =
      request.nextUrl.searchParams.get("scope") === "all" && (await ensureAdmin(request));
    const projects = getAllProjects({ includeDraft });

    return NextResponse.json({
      projects,
      studioAuthorized: includeDraft,
    });
  } catch (error) {
    console.error("GET /api/projects failed", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await ensureAdmin(request))) {
    return unauthorized();
  }

  return NextResponse.json({ ok: true, message: "当前为纯静态模式，项目数据请直接修改 lib/projects.ts" }, { status: 200 });
}
