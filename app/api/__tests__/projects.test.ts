import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { ProjectItem } from "@/lib/projects";

const mockGetAllProjects = vi.fn();
const mockIsStudioAuthorized = vi.fn();
const mockUpsertProject = vi.fn();
const mockDeleteProject = vi.fn();
const mockSeedProjects = vi.fn();

vi.mock("@/lib/projects-source", () => ({
  getAllProjects: (...args: unknown[]) => mockGetAllProjects(...args),
}));

vi.mock("@/lib/projects-store", () => ({
  upsertProject: (...args: unknown[]) => mockUpsertProject(...args),
  deleteProject: (...args: unknown[]) => mockDeleteProject(...args),
  seedProjects: (...args: unknown[]) => mockSeedProjects(...args),
}));

vi.mock("@/lib/studio-auth", () => ({
  isStudioAuthorized: (...args: unknown[]) => mockIsStudioAuthorized(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

import { GET, POST } from "@/app/api/projects/route";

function makeRequest(url: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  body?: string;
}): NextRequest {
  const req = new NextRequest(url, {
    method: init?.method ?? "GET",
    headers: init?.headers,
    body: init?.body,
  });

  if (init?.cookies) {
    for (const [name, value] of Object.entries(init.cookies)) {
      req.cookies.set(name, value);
    }
  }

  return req;
}

function makeProject(overrides: Partial<ProjectItem> = {}): ProjectItem {
  return {
    slug: "test",
    status: "live",
    visibility: "published",
    title: { zh: "测试", en: "Test" },
    tagline: { zh: "描述", en: "Tagline" },
    summary: { zh: "摘要", en: "Summary" },
    description: { zh: "详情", en: "Details" },
    design: { zh: "", en: "" },
    architecture: { zh: "", en: "" },
    cover: "/test.svg",
    tech: [],
    github: "",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/projects", () => {
  it("returns published projects by default", async () => {
    const projects = [
      makeProject({ slug: "a", status: "live" }),
      makeProject({ slug: "b", status: "completed" }),
    ];
    mockGetAllProjects.mockReturnValue(projects);

    const res = await GET(makeRequest("http://localhost/api/projects"));
    const json = (await res.json()) as { projects: ProjectItem[]; studioAuthorized: boolean };

    expect(res.status).toBe(200);
    expect(json.projects).toHaveLength(2);
    expect(json.studioAuthorized).toBe(false);
  });

  it("returns published-only when scope=all without auth", async () => {
    mockGetAllProjects.mockReturnValue([makeProject({ slug: "a" })]);
    mockIsStudioAuthorized.mockResolvedValue(false);

    const res = await GET(
      makeRequest("http://localhost/api/projects?scope=all")
    );
    const json = (await res.json()) as { studioAuthorized: boolean };

    expect(json.studioAuthorized).toBe(false);
    expect(mockGetAllProjects).toHaveBeenCalledWith({ includeDraft: false });
  });

  it("returns all projects when scope=all with auth", async () => {
    mockGetAllProjects.mockReturnValue([makeProject({ slug: "a", visibility: "draft" })]);
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await GET(
      makeRequest("http://localhost/api/projects?scope=all")
    );
    const json = (await res.json()) as { studioAuthorized: boolean };

    expect(json.studioAuthorized).toBe(true);
    expect(mockGetAllProjects).toHaveBeenCalledWith({ includeDraft: true });
  });

  it("returns 500 on error", async () => {
    mockGetAllProjects.mockImplementation(() => {
      throw new Error("Boom");
    });

    const res = await GET(makeRequest("http://localhost/api/projects"));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to load projects");
  });
});

describe("POST /api/projects", () => {
  it("returns 401 when not authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(false);

    const res = await POST(makeRequest("http://localhost/api/projects"));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("upserts a project", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    const project = makeProject({ slug: "my-project" });

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "upsert", project }),
    }));
    const json = (await res.json()) as { ok: boolean; message: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockUpsertProject).toHaveBeenCalledWith(project);
  });

  it("rejects upsert without slug", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "upsert", project: { title: { zh: "no slug" } } }),
    }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toContain("slug");
    expect(mockUpsertProject).not.toHaveBeenCalled();
  });

  it("deletes a project", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "delete", slug: "my-project" }),
    }));
    const json = (await res.json()) as { ok: boolean; message: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockDeleteProject).toHaveBeenCalledWith("my-project");
  });

  it("rejects delete without slug", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "delete" }),
    }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toContain("slug");
    expect(mockDeleteProject).not.toHaveBeenCalled();
  });

  it("seeds from static data", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    mockSeedProjects.mockReturnValue(5);

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "seed" }),
    }));
    const json = (await res.json()) as { ok: boolean; message: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.message).toContain("5");
    expect(mockSeedProjects).toHaveBeenCalledOnce();
  });

  it("returns 400 for unknown action", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "unknown" }),
    }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toContain("未知操作");
  });

  it("returns 500 on error", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    mockUpsertProject.mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await POST(makeRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ action: "upsert", project: makeProject() }),
    }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("操作失败");
  });
});
