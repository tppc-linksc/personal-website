import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const mockIsStudioAuthorized = vi.fn();

vi.mock("@/lib/studio-auth", () => ({
  isStudioAuthorized: (...args: unknown[]) => mockIsStudioAuthorized(...args),
  STUDIO_SESSION_COOKIE: "studio_session",
}));

import { POST } from "@/app/api/studio/upload/route";

let testDataDir = "";

function makeMockFile(name: string, bytes: number[]): File {
  const binary = Uint8Array.from(bytes);
  return {
    name,
    size: binary.byteLength,
    arrayBuffer: async () => binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength),
  } as unknown as File;
}

function makeUploadRequest(file?: File): NextRequest {
  const formData = {
    get: (key: string) => (key === "file" ? (file ?? null) : null),
  } as unknown as FormData;

  return {
    headers: new Headers(),
    cookies: {
      get: () => undefined,
    },
    formData: async () => formData,
  } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  testDataDir = mkdtempSync(join(tmpdir(), "portfolio-upload-test-"));
  process.env.PORTFOLIO_DATA_DIR = testDataDir;
});

afterEach(() => {
  delete process.env.PORTFOLIO_DATA_DIR;
  if (testDataDir) {
    rmSync(testDataDir, { recursive: true, force: true });
  }
});

describe("POST /api/studio/upload", () => {
  it("returns 401 when not authorized", async () => {
    mockIsStudioAuthorized.mockResolvedValue(false);

    const res = await POST(makeUploadRequest());
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("rejects fake webp that only matches RIFF prefix", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    const fakeWebp = makeMockFile("fake.webp", [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x4a, 0x55, 0x4e, 0x4b]);

    const res = await POST(makeUploadRequest(fakeWebp));
    const json = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toContain("文件签名不匹配");
  });

  it("rejects truncated png header", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    const truncatedPng = makeMockFile("short.png", [0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00]);

    const res = await POST(makeUploadRequest(truncatedPng));
    expect(res.status).toBe(400);
  });

  it("stores valid webp under PORTFOLIO_DATA_DIR/uploads", async () => {
    mockIsStudioAuthorized.mockResolvedValue(true);
    const validWebp = makeMockFile("cover.webp", [0x52, 0x49, 0x46, 0x46, 0x18, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20]);

    const res = await POST(makeUploadRequest(validWebp));
    const json = (await res.json()) as { cover?: string; ok?: boolean };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.cover).toMatch(/^\/api\/uploads\/[a-f0-9-]+\.webp$/);

    const filename = json.cover!.replace("/api/uploads/", "");
    const saved = readFileSync(join(testDataDir, "uploads", filename));
    expect(saved.length).toBe(16);
    expect(saved[0]).toBe(0x52);
    expect(saved[8]).toBe(0x57);
  });
});
