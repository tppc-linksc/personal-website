import { NextRequest, NextResponse } from "next/server";
import { getAllProjects } from "@/lib/projects-source";
import { upsertProject, deleteProject, seedProjects } from "@/lib/projects-store";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";
import type { ProjectItem } from "@/lib/projects";

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

  try {
    const body = (await request.json()) as {
      action: "upsert" | "delete" | "seed";
      project?: ProjectItem;
      slug?: string;
    };

    switch (body.action) {
      case "upsert": {
        if (!body.project?.slug) {
          return NextResponse.json({ error: "项目 slug 不能为空" }, { status: 400 });
        }
        upsertProject(body.project);
        return NextResponse.json({ ok: true, message: "项目已保存" });
      }

      case "delete": {
        if (!body.slug) {
          return NextResponse.json({ error: "项目 slug 不能为空" }, { status: 400 });
        }
        deleteProject(body.slug);
        return NextResponse.json({ ok: true, message: "项目已删除" });
      }

      case "seed": {
        const count = seedProjects();
        return NextResponse.json({ ok: true, message: `已从静态数据导入 ${count} 个项目` });
      }

      default:
        return NextResponse.json({ error: `未知操作: ${body.action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/projects failed", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
