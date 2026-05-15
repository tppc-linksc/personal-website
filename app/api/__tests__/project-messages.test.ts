import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { MessageItem, MessageNode } from "@/lib/messages";

const mockGetProjectBySlug = vi.fn();
const mockGetMessageById = vi.fn();
const mockGetMessageTreeByProject = vi.fn();
const mockCreateMessage = vi.fn();
const mockIsStudioAuthorized = vi.fn();
const mockIsRateLimited = vi.fn();

vi.mock("@/lib/projects-source", () => ({
  getProjectBySlug: (...args: unknown[]) => mockGetProjectBySlug(...args),
}));

vi.mock("@/lib/messages-source", () => ({
  getMessageById: (...args: unknown[]) => mockGetMessageById(...args),
  getMessageTreeByProject: (...args: unknown[]) => mockGetMessageTreeByProject(...args),
  createMessage: (...args: unknown[]) => mockCreateMessage(...args),
}));

vi.mock("@/lib/studio-auth", () => ({
  isStudioAuthorized: (...args: unknown[]) => mockIsStudioAuthorized(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: (...args: unknown[]) => mockIsRateLimited(...args),
}));

import { GET, POST } from "@/app/api/projects/[slug]/messages/route";

function makeRequest(init?: {
  body?: unknown;
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const req = new NextRequest("http://localhost/api/projects/test/messages", {
    method: init?.method ?? "GET",
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

function makeProject(overrides: Record<string, unknown> = {}) {
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

function makeMsg(id: string, parentId?: string): MessageItem {
  return {
    id,
    projectSlug: "test",
    parentId,
    authorType: "guest",
    nickname: "user",
    content: `Message ${id}`,
    status: "approved",
    createdAt: 0,
  };
}

const mockParams = Promise.resolve({ slug: "test" });

beforeEach(() => {
  vi.clearAllMocks();
  mockGetProjectBySlug.mockResolvedValue(makeProject());
  mockIsStudioAuthorized.mockResolvedValue(false);
  mockIsRateLimited.mockReturnValue(false);
});

describe("GET /api/projects/[slug]/messages", () => {
  it("returns 404 when project not found", async () => {
    mockGetProjectBySlug.mockResolvedValue(undefined);

    const res = await GET(makeRequest(), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(404);
    expect(json.error).toBe("Project not found");
  });

  it("returns messages for valid project", async () => {
    const tree: MessageNode[] = [{ ...makeMsg("1"), replies: [] }];
    mockGetMessageTreeByProject.mockResolvedValue(tree);

    const res = await GET(makeRequest(), { params: mockParams });
    const json = (await res.json()) as { messages: MessageNode[]; canPostAsOwner: boolean };

    expect(res.status).toBe(200);
    expect(json.messages).toHaveLength(1);
    expect(json.canPostAsOwner).toBe(false);
    expect(mockGetProjectBySlug).toHaveBeenCalledWith("test", { includeDraft: false });
  });

  it("sets canPostAsOwner true when authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    mockGetMessageTreeByProject.mockResolvedValue([]);

    const res = await GET(makeRequest(), { params: mockParams });
    const json = (await res.json()) as { canPostAsOwner: boolean };

    expect(json.canPostAsOwner).toBe(true);
    expect(mockGetProjectBySlug).toHaveBeenCalledWith("test", { includeDraft: true });
  });

  it("returns 500 on error", async () => {
    mockGetProjectBySlug.mockRejectedValue(new Error("Boom"));

    const res = await GET(makeRequest(), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to load messages");
  });
});

describe("POST /api/projects/[slug]/messages", () => {
  it("returns 404 when project not found", async () => {
    mockGetProjectBySlug.mockResolvedValue(undefined);

    const res = await POST(makeRequest({ body: { content: "hello" }, method: "POST" }), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(404);
    expect(json.error).toBe("Project not found");
  });

  it("returns 400 when content is empty", async () => {
    const res = await POST(makeRequest({ body: { content: "" }, method: "POST" }), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid content");
  });

  it("returns 400 when content is too long", async () => {
    const res = await POST(
      makeRequest({ body: { content: "a".repeat(801) }, method: "POST" }),
      { params: mockParams }
    );
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid content");
  });

  it("returns 400 when parent message not found", async () => {
    mockGetMessageById.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest({ body: { content: "reply", parentId: "nonexistent" }, method: "POST" }),
      { params: mockParams }
    );
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Parent message not found");
  });

  it("returns 429 when rate limited for guest", async () => {
    mockIsRateLimited.mockReturnValue(true);

    const res = await POST(
      makeRequest({ body: { content: "hello" }, method: "POST" }),
      { params: mockParams }
    );
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(429);
    expect(json.error).toBe("Too many requests");
  });

  it("creates message with guest authorType when not authorized", async () => {
    const created: MessageItem = makeMsg("new");
    mockCreateMessage.mockResolvedValue(created);

    const res = await POST(
      makeRequest({ body: { content: "hello" }, method: "POST" }),
      { params: mockParams }
    );
    const json = (await res.json()) as { message: MessageItem };

    expect(res.status).toBe(200);
    expect(json.message.id).toBe("new");
    expect(mockCreateMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        projectSlug: "test",
        content: "hello",
        authorType: "guest",
      })
    );
    expect(mockGetProjectBySlug).toHaveBeenCalledWith("test", { includeDraft: false });
  });

  it("creates message with owner authorType when authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    const created: MessageItem = { ...makeMsg("new"), authorType: "owner" };
    mockCreateMessage.mockResolvedValue(created);

    const res = await POST(
      makeRequest({ body: { content: "owner reply" }, method: "POST" }),
      { params: mockParams }
    );
    const json = (await res.json()) as { message: MessageItem };

    expect(res.status).toBe(200);
    expect(json.message.authorType).toBe("owner");
    expect(mockCreateMessage).toHaveBeenCalledWith(
      expect.objectContaining({ authorType: "owner" })
    );
    expect(mockGetProjectBySlug).toHaveBeenCalledWith("test", { includeDraft: true });
  });

  it("returns 500 on error", async () => {
    mockCreateMessage.mockRejectedValue(new Error("Boom"));

    const res = await POST(
      makeRequest({ body: { content: "hello" }, method: "POST" }),
      { params: mockParams }
    );
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to post message");
  });

  it("skips rate limit for authorized owner", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    mockCreateMessage.mockResolvedValue(makeMsg("new"));

    const res = await POST(
      makeRequest({ body: { content: "owner post" }, method: "POST" }),
      { params: mockParams }
    );

    expect(res.status).toBe(200);
    expect(mockIsRateLimited).not.toHaveBeenCalled();
  });

  it("truncates long nickname", async () => {
    mockCreateMessage.mockResolvedValue(makeMsg("new"));

    await POST(
      makeRequest({ body: { content: "hello", nickname: "a".repeat(50) }, method: "POST" }),
      { params: mockParams }
    );

    expect(mockCreateMessage).toHaveBeenCalledWith(
      expect.objectContaining({ nickname: expect.stringMatching(/^.{1,40}$/) as unknown })
    );
  });
});
