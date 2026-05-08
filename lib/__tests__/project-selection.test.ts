import { describe, it, expect } from "vitest";
import { projectYear, projectRouteDate, sortProjects, selectFeaturedProjects } from "../project-selection";
import type { ProjectItem } from "../projects";

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

describe("projectYear", () => {
  it("extracts year from eta", () => {
    const p = makeProject({ eta: "2026 Q3" });
    expect(projectYear(p)).toBe("2026");
  });

  it("falls back to publishedAt when no eta", () => {
    const p = makeProject({ publishedAt: new Date("2024-03-15").getTime() });
    expect(projectYear(p)).toBe("2024");
  });

  it("falls back to updatedAt when no eta or publishedAt", () => {
    const p = makeProject({ updatedAt: new Date("2023-06-01").getTime() });
    expect(projectYear(p)).toBe("2023");
  });

  it("returns TBD when all dates are missing", () => {
    const p = makeProject({});
    expect(projectYear(p)).toBe("TBD");
  });

  it("handles eta with no year match", () => {
    const p = makeProject({ eta: "Soon™" });
    expect(projectYear(p)).toBe("TBD");
  });
});

describe("projectRouteDate", () => {
  it("uses githubCreatedAt when available", () => {
    const p = makeProject({ githubCreatedAt: "2025-01-15T00:00:00Z" });
    expect(projectRouteDate(p)).toContain("2025");
  });

  it("falls back to publishedAt when no githubCreatedAt", () => {
    const p = makeProject({ publishedAt: new Date("2024-05-20").getTime() });
    expect(projectRouteDate(p)).toContain("2024");
  });

  it("falls back to updatedAt when all else missing", () => {
    const p = makeProject({ updatedAt: new Date("2023-08-10").getTime() });
    expect(projectRouteDate(p)).toContain("2023");
  });

  it("returns TBD when all dates missing", () => {
    expect(projectRouteDate(makeProject({}))).toBe("TBD");
  });
});

describe("sortProjects", () => {
  it("sorts by status order: live before completed before in_progress before planned", () => {
    const projects = [
      makeProject({ slug: "a", status: "planned" }),
      makeProject({ slug: "b", status: "live" }),
      makeProject({ slug: "c", status: "completed" }),
      makeProject({ slug: "d", status: "in_progress" }),
    ];
    const sorted = sortProjects(projects);
    expect(sorted.map((p) => p.status)).toEqual([
      "live",
      "completed",
      "in_progress",
      "planned",
    ]);
  });

  it("within same status, sorts by updatedAt descending", () => {
    const projects = [
      makeProject({ slug: "a", status: "live", updatedAt: 100 }),
      makeProject({ slug: "b", status: "live", updatedAt: 300 }),
      makeProject({ slug: "c", status: "live", updatedAt: 200 }),
    ];
    const sorted = sortProjects(projects);
    expect(sorted.map((p) => p.slug)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate input array", () => {
    const projects = [makeProject({ slug: "a" })];
    const copy = [...projects];
    sortProjects(projects);
    expect(projects).toEqual(copy);
  });

  it("returns empty for empty input", () => {
    expect(sortProjects([])).toEqual([]);
  });
});

describe("selectFeaturedProjects", () => {
  it("returns at most count items", () => {
    const projects = [
      makeProject({ slug: "a", defaultFeatured: true }),
      makeProject({ slug: "b", defaultFeatured: true }),
      makeProject({ slug: "c", defaultFeatured: true }),
      makeProject({ slug: "d", defaultFeatured: true }),
      makeProject({ slug: "e", defaultFeatured: true }),
    ];
    expect(selectFeaturedProjects(projects, 3)).toHaveLength(3);
  });

  it("returns fewer than count when not enough projects", () => {
    const projects = [makeProject({ slug: "a" })];
    expect(selectFeaturedProjects(projects, 3)).toHaveLength(1);
  });

  it("returns empty when no projects", () => {
    expect(selectFeaturedProjects([], 3)).toEqual([]);
  });

  it("prefers high-star projects first", () => {
    const projects = [
      makeProject({ slug: "low", stars: 1 }),
      makeProject({ slug: "high", stars: 100 }),
      makeProject({ slug: "mid", stars: 50 }),
    ];
    const result = selectFeaturedProjects(projects, 2);
    expect(result[0].slug).toBe("high");
  });

  it("fills remaining slots with defaultFeatured projects", () => {
    const projects = [
      makeProject({ slug: "star", stars: 100 }),
      makeProject({ slug: "featured", defaultFeatured: true }),
      makeProject({ slug: "other" }),
    ];
    const result = selectFeaturedProjects(projects, 2);
    expect(result).toHaveLength(2);
    const slugs = result.map((p) => p.slug);
    expect(slugs).toContain("star");
    expect(slugs).toContain("featured");
  });

  it("does not duplicate projects", () => {
    const projects = [
      makeProject({ slug: "only", stars: 10, defaultFeatured: true }),
    ];
    const result = selectFeaturedProjects(projects, 3);
    expect(result).toHaveLength(1);
  });
});
