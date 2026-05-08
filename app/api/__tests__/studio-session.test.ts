import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockVerifyStudioSession = vi.fn();
const mockVerifyAdminToken = vi.fn();
const mockCreateStudioSessionToken = vi.fn();
const mockGetStudioSessionMaxAge = vi.fn();
const mockIsRateLimited = vi.fn();

vi.mock("@/lib/studio-auth", () => ({
  verifyStudioSession: (...args: unknown[]) => mockVerifyStudioSession(...args),
  verifyAdminToken: (...args: unknown[]) => mockVerifyAdminToken(...args),
  createStudioSessionToken: (...args: unknown[]) => mockCreateStudioSessionToken(...args),
  getStudioSessionMaxAge: (...args: unknown[]) => mockGetStudioSessionMaxAge(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: (...args: unknown[]) => mockIsRateLimited(...args),
}));

import { GET, POST, DELETE } from "@/app/api/studio/session/route";

function makeRequest(init?: {
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const req = new NextRequest("http://localhost/api/studio/session", {
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
  mockGetStudioSessionMaxAge.mockReturnValue(86400);
});

describe("GET /api/studio/session", () => {
  it("returns authenticated: false when no session cookie", async () => {
    mockVerifyStudioSession.mockResolvedValue(false);

    const res = await GET(makeRequest());
    const json = (await res.json()) as { authenticated: boolean };

    expect(res.status).toBe(200);
    expect(json.authenticated).toBe(false);
  });

  it("returns authenticated: true when session cookie is valid", async () => {
    mockVerifyStudioSession.mockResolvedValue(true);

    const res = await GET(
      makeRequest({ cookies: { studio_session: "valid-token" } })
    );
    const json = (await res.json()) as { authenticated: boolean };

    expect(res.status).toBe(200);
    expect(json.authenticated).toBe(true);
  });
});

describe("POST /api/studio/session", () => {
  it("returns 401 when no token provided", async () => {
    mockVerifyAdminToken.mockResolvedValue(false);

    const res = await POST(makeRequest({ body: {} }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 when token is wrong", async () => {
    mockVerifyAdminToken.mockResolvedValue(false);

    const res = await POST(makeRequest({ body: { token: "wrong" } }));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 200 and sets cookie when token is correct", async () => {
    mockVerifyAdminToken.mockResolvedValue(true);
    mockCreateStudioSessionToken.mockResolvedValue("session-token-123");

    const res = await POST(makeRequest({ body: { token: "correct" } }));
    const json = (await res.json()) as { ok: boolean };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);

    const setCookie = res.headers.getSetCookie();
    expect(setCookie.length).toBeGreaterThan(0);
    expect(setCookie[0]).toContain("studio_session");
    expect(setCookie[0]).toContain("session-token-123");
    expect(setCookie[0]).toContain("HttpOnly");
    expect(setCookie[0].toLowerCase()).toContain("samesite=strict");
  });

  it("returns 429 when rate limited", async () => {
    mockIsRateLimited.mockReturnValue(true);

    const res = await POST(
      makeRequest({
        body: { token: "anything" },
        headers: { "x-forwarded-for": "1.2.3.4" },
      })
    );
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(429);
    expect(json.error).toBe("Too many login attempts");
  });

  it("uses x-real-ip when x-forwarded-for is absent", async () => {
    mockIsRateLimited.mockReturnValue(true);

    const res = await POST(
      makeRequest({
        body: { token: "anything" },
        headers: { "x-real-ip": "5.6.7.8" },
      })
    );

    expect(res.status).toBe(429);
  });
});

describe("DELETE /api/studio/session", () => {
  it("clears session cookie and returns 200", async () => {
    const res = await DELETE();
    const json = (await res.json()) as { ok: boolean };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);

    const setCookie = res.headers.getSetCookie();
    expect(setCookie.length).toBeGreaterThan(0);
    expect(setCookie[0]).toContain("studio_session");
    expect(setCookie[0]).toContain("Max-Age=0");
  });
});
