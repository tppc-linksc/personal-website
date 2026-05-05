import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import type { ProjectItem, ProjectVisibility } from "@/lib/projects";
import {
  deleteProject,
  getAllProjects,
  invalidateProjectsCache,
  isCloudbaseEnabled,
  saveProject,
  seedProjects,
} from "@/lib/projects-source";
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

function normalizeText(value: unknown) {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.zh === "string" && typeof record.en === "string") {
      return { zh: record.zh, en: record.en };
    }
  }

  return { zh: "", en: "" };
}

function normalizeVisibility(value: unknown): ProjectVisibility {
  if (value === "draft" || value === "published") {
    return value;
  }
  return "published";
}

function normalizeProgress(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeProject(value: unknown): ProjectItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = typeof record.slug === "string" ? record.slug.trim() : "";
  const github = typeof record.github === "string" ? record.github.trim() : "";

  if (!slug || !github) {
    return null;
  }

  const status = record.status;
  if (status !== "live" && status !== "completed" && status !== "in_progress" && status !== "planned") {
    return null;
  }

  const visibility = normalizeVisibility(record.visibility);
  const now = Date.now();

  return {
    slug,
    status,
    visibility,
    defaultFeatured: record.defaultFeatured === true,
    stars: typeof record.stars === "number" ? record.stars : undefined,
    githubCreatedAt: typeof record.githubCreatedAt === "string" ? record.githubCreatedAt : undefined,
    title: normalizeText(record.title),
    tagline: normalizeText(record.tagline),
    summary: normalizeText(record.summary),
    description: normalizeText(record.description),
    design: normalizeText(record.design),
    architecture: normalizeText(record.architecture),
    cover: typeof record.cover === "string" ? record.cover : "",
    eta: typeof record.eta === "string" ? record.eta : undefined,
    progress: normalizeProgress(record.progress),
    tech: Array.isArray(record.tech)
      ? record.tech.filter((item): item is string => typeof item === "string")
      : [],
    github,
    live: typeof record.live === "string" ? record.live : undefined,
    videoUrl: typeof record.videoUrl === "string" ? record.videoUrl : undefined,
    updatedAt: now,
    publishedAt: visibility === "published" ? now : undefined,
  };
}

function revalidatePortfolioPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/en");
  revalidatePath("/zh/projects");
  revalidatePath("/en/projects");
  if (slug) {
    revalidatePath(`/zh/projects/${slug}`);
    revalidatePath(`/en/projects/${slug}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const includeDraft =
      request.nextUrl.searchParams.get("scope") === "all" && (await ensureAdmin(request));
    const projects = await getAllProjects({ includeDraft });

    return NextResponse.json({
      projects,
      cloudbaseEnabled: isCloudbaseEnabled(),
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

  if (!isCloudbaseEnabled()) {
    return NextResponse.json({ error: "CloudBase is not configured" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { action?: string; project?: unknown; slug?: unknown };

    if (body.action === "seed") {
      await seedProjects();
      invalidateProjectsCache();
      revalidatePortfolioPaths();
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete") {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
      }
      const slug = body.slug.trim();
      await deleteProject(slug);
      invalidateProjectsCache();
      revalidatePortfolioPaths(slug);
      return NextResponse.json({ ok: true });
    }

    const project = normalizeProject(body.project);
    if (!project) {
      return NextResponse.json({ error: "Invalid project payload" }, { status: 400 });
    }

    await saveProject(project);
    invalidateProjectsCache();
    revalidatePortfolioPaths(project.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/projects failed", error);
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }
}
