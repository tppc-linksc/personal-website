import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import { GET } from "@/app/api/uploads/[filename]/route";

let testDataDir = "";

beforeEach(() => {
  testDataDir = mkdtempSync(join(tmpdir(), "portfolio-uploads-read-test-"));
  mkdirSync(join(testDataDir, "uploads"), { recursive: true });
  process.env.PORTFOLIO_DATA_DIR = testDataDir;
});

afterEach(() => {
  delete process.env.PORTFOLIO_DATA_DIR;
  if (testDataDir) {
    rmSync(testDataDir, { recursive: true, force: true });
  }
});

describe("GET /api/uploads/[filename]", () => {
  it("returns 404 for invalid filename", async () => {
    const res = await GET(new Request("http://localhost/api/uploads/../evil.png"), {
      params: Promise.resolve({ filename: "../evil.png" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 when file does not exist", async () => {
    const res = await GET(new Request("http://localhost/api/uploads/missing.png"), {
      params: Promise.resolve({ filename: "123e4567-e89b-12d3-a456-426614174000.png" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns image bytes with proper cache headers", async () => {
    const filename = "123e4567-e89b-12d3-a456-426614174000.png";
    const content = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    writeFileSync(join(testDataDir, "uploads", filename), content);

    const res = await GET(new Request(`http://localhost/api/uploads/${filename}`), {
      params: Promise.resolve({ filename }),
    });
    const body = Buffer.from(await res.arrayBuffer());

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
    expect(body.equals(content)).toBe(true);
  });
});
