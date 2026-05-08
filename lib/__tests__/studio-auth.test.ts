import { describe, it, expect, beforeEach } from "vitest";
import {
  verifyAdminToken,
  verifyStudioSession,
  createStudioSessionToken,
  isStudioAuthorized,
  getStudioSessionMaxAge,
  STUDIO_SESSION_COOKIE,
} from "../studio-auth";

beforeEach(() => {
  delete process.env.STUDIO_ADMIN_TOKEN;
  delete process.env.STUDIO_ADMIN_TOKEN_HASH;
  delete process.env.STUDIO_SESSION_SECRET;
});

describe("verifyAdminToken", () => {
  it("returns false for null token", async () => {
    expect(await verifyAdminToken(null)).toBe(false);
  });

  it("returns false for empty string", async () => {
    expect(await verifyAdminToken("")).toBe(false);
  });

  it("verifies plain token when STUDIO_ADMIN_TOKEN is set", async () => {
    process.env.STUDIO_ADMIN_TOKEN = "my-secret-token";
    expect(await verifyAdminToken("my-secret-token")).toBe(true);
  });

  it("rejects wrong plain token", async () => {
    process.env.STUDIO_ADMIN_TOKEN = "my-secret-token";
    expect(await verifyAdminToken("wrong-token")).toBe(false);
  });

  it("returns false when no admin token is configured", async () => {
    expect(await verifyAdminToken("anything")).toBe(false);
  });
});

describe("verifyStudioSession", () => {
  it("returns false for undefined value", async () => {
    expect(await verifyStudioSession(undefined)).toBe(false);
  });

  it("returns false for empty string", async () => {
    expect(await verifyStudioSession("")).toBe(false);
  });

  it("returns false for malformed token", async () => {
    expect(await verifyStudioSession("not-a-valid-token")).toBe(false);
  });

  it("returns false for expired token", async () => {
    process.env.STUDIO_SESSION_SECRET = "test-secret";
    const expired = "1.nonce.badsig";
    expect(await verifyStudioSession(expired)).toBe(false);
  });
});

describe("createStudioSessionToken", () => {
  it("creates a valid token that verifies", async () => {
    process.env.STUDIO_SESSION_SECRET = "test-secret";
    const token = await createStudioSessionToken();
    expect(token).toBeTruthy();
    expect(token.split(".")).toHaveLength(3);

    const valid = await verifyStudioSession(token);
    expect(valid).toBe(true);
  });

  it("throws when no secret is configured", async () => {
    delete process.env.STUDIO_SESSION_SECRET;
    delete process.env.STUDIO_ADMIN_TOKEN;
    delete process.env.STUDIO_ADMIN_TOKEN_HASH;
    await expect(createStudioSessionToken()).rejects.toThrow();
  });
});

describe("isStudioAuthorized", () => {
  it("returns false with no credentials", async () => {
    expect(await isStudioAuthorized({})).toBe(false);
  });

  it("returns true with valid session cookie", async () => {
    process.env.STUDIO_SESSION_SECRET = "test-secret";
    const token = await createStudioSessionToken();
    expect(await isStudioAuthorized({ sessionCookie: token })).toBe(true);
  });

  it("returns true with valid token header", async () => {
    process.env.STUDIO_ADMIN_TOKEN = "admin";
    expect(await isStudioAuthorized({ tokenHeader: "admin" })).toBe(true);
  });
});

describe("getStudioSessionMaxAge", () => {
  it("returns a positive number", () => {
    expect(getStudioSessionMaxAge()).toBeGreaterThan(0);
  });
});

describe("STUDIO_SESSION_COOKIE", () => {
  it("equals studio_session", () => {
    expect(STUDIO_SESSION_COOKIE).toBe("studio_session");
  });
});
