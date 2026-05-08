import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockModerateMessage = vi.fn();
const mockIsStudioAuthorized = vi.fn();

vi.mock("@/lib/messages-source", () => ({
  moderateMessage: (...args: unknown[]) => mockModerateMessage(...args),
}));

vi.mock("@/lib/studio-auth", () => ({
  isStudioAuthorized: (...args: unknown[]) => mockIsStudioAuthorized(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

import { POST } from "@/app/api/messages/[id]/moderate/route";

function makeRequest(init?: {
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const req = new NextRequest("http://localhost/api/messages/msg-1/moderate", {
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

const mockParams = Promise.resolve({ id: "msg-1" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/messages/[id]/moderate", () => {
  it("returns 401 when not authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(false);

    const res = await POST(makeRequest({ body: { status: "approved" } }), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when status is invalid", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest({ body: { status: "deleted" } }), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid status");
  });

  it("returns 400 when status is missing", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest({ body: {} }), { params: mockParams });
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid status");
  });

  it("approves message with valid status", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest({ body: { status: "approved" } }), { params: mockParams });
    const json = (await res.json()) as { ok: boolean };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockModerateMessage).toHaveBeenCalledWith("msg-1", "approved");
  });

  it("hides message with valid status", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);

    const res = await POST(makeRequest({ body: { status: "hidden" } }), { params: mockParams });
    const json = (await res.json()) as { ok: boolean };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockModerateMessage).toHaveBeenCalledWith("msg-1", "hidden");
  });
});
