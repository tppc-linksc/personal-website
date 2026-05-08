import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { ProjectItem } from "@/lib/projects";

const mockGetAllProjects = vi.fn();
const mockIsStudioAuthorized = vi.fn();

vi.mock("@/lib/projects-source", () => ({
  getAllProjects: (...args: unknown[]) => mockGetAllProjects(...args),
}));

vi.mock("@/lib/studio-auth", () => ({
  isStudioAuthorized: (...args: unknown[]) => mockIsStudioAuthorized(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

import { GET, POST } from "@/app/api/projects/route";

function makeRequest(url: string, init?: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const req = new NextRequest(url, { headers: init?.headers });

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

  it("returns 200 with static mode message when authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest("http://localhost/api/projects"));
    const json = (await res.json()) as { ok: boolean; message: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.message).toContain("静态模式");
  });
});
