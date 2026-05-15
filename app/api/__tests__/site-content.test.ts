import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetContent = vi.fn();
const mockSetContent = vi.fn();
const mockRevalidatePath = vi.fn();
const mockIsStudioAuthorized = vi.fn();

vi.mock("@/lib/site-content", () => ({
  getContent: (...args: unknown[]) => mockGetContent(...args),
  setContent: (...args: unknown[]) => mockSetContent(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("@/lib/studio-auth", () => ({
  isStudioAuthorized: (...args: unknown[]) => mockIsStudioAuthorized(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

import { GET, POST } from "@/app/api/site-content/route";

function makeRequest(init?: {
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const url = "http://localhost/api/site-content";
  const req = new NextRequest(url, {
    method: "POST",
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
    headers: init?.headers,
  });

  if (init?.cookies) {
    for (const [name, value] of Object.entries(init.cookies)) {
      req.cookies.set(name, value);
    }
  }

  return req;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/site-content", () => {
  it("returns content from getContent", async () => {
    mockGetContent.mockReturnValue({ hero: { greeting: { zh: "你好", en: "Hi" } } });

    const res = await GET();
    const json = (await res.json()) as { content: unknown };

    expect(res.status).toBe(200);
    expect(json.content).toHaveProperty("hero");
  });
});

describe("POST /api/site-content", () => {
  it("returns 401 when not authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(false);

    const res = await POST(makeRequest({ body: { content: {} } }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when content is missing", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest({ body: {} }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid content structure");
  });

  it("returns 400 when content is not an object", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest({ body: { content: "string" } }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid content structure");
  });

  it("returns 200 and saves content when authorized with valid body", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    const content = {
      hero: {
        greeting: { zh: "你好", en: "Hi" },
        title: { zh: "标题", en: "Title" },
        summary: { zh: "摘要", en: "Summary" },
        ctaPrimary: { zh: "按钮", en: "Button" },
        ctaPrimaryUrl: "/",
        ctaSecondary: { zh: "次要", en: "Secondary" },
        ctaSecondaryUrl: "/other",
      },
      about: {
        title: { zh: "关于", en: "About" },
        description: { zh: "描述", en: "Description" },
        skills: ["skill1"],
        avatar: "/avatar.svg",
      },
      brand: { name: "Test Brand" },
      footer: { github: "https://github.com/test", email: "mailto:test@test.com" },
    };

    const res = await POST(makeRequest({ body: { content } }));
    const json = (await res.json()) as { ok: boolean };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockSetContent).toHaveBeenCalledWith(content);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("returns 500 when body parsing fails", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const req = new NextRequest("http://localhost/api/site-content", {
      method: "POST",
      body: "not-json{",
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to save content");
  });
});
