import { describe, it, expect, beforeEach, vi } from "vitest";

const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockExistsSync = vi.fn();
const mockMkdirSync = vi.fn();
const mockRenameSync = vi.fn();

vi.mock("fs", () => ({
  default: {
    readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
    writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
    existsSync: (...args: unknown[]) => mockExistsSync(...args),
    mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
    renameSync: (...args: unknown[]) => mockRenameSync(...args),
  },
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
  writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
  renameSync: (...args: unknown[]) => mockRenameSync(...args),
}));

import { GET, POST } from "@/app/api/metrics/visits/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockExistsSync.mockReturnValue(true);
  mockReadFileSync.mockReturnValue(JSON.stringify({ visits: 42 }));
});

describe("GET /api/metrics/visits", () => {
  it("returns visit count with no-store cache header", async () => {
    const res = await GET();
    const json = (await res.json()) as { visits: number; enabled: boolean };

    expect(res.status).toBe(200);
    expect(json.visits).toBe(42);
    expect(json.enabled).toBe(true);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 0 when data file does not exist", async () => {
    mockExistsSync.mockReturnValue(false);

    const res = await GET();
    const json = (await res.json()) as { visits: number };

    expect(json.visits).toBe(0);
  });

  it("returns 0 when data file is corrupt", async () => {
    mockReadFileSync.mockReturnValue("not-json{");

    const res = await GET();
    const json = (await res.json()) as { visits: number };

    expect(json.visits).toBe(0);
  });
});

describe("POST /api/metrics/visits", () => {
  it("increments visit count", async () => {
    const res = await POST();
    const json = (await res.json()) as { visits: number };

    expect(res.status).toBe(200);
    expect(json.visits).toBe(43);
    expect(mockWriteFileSync).toHaveBeenCalled();
    expect(mockRenameSync).toHaveBeenCalled();
  });

  it("starts from 0 when no data file", async () => {
    mockExistsSync.mockReturnValue(false);

    const res = await POST();
    const json = (await res.json()) as { visits: number };

    expect(json.visits).toBe(1);
  });

  it("creates data directory if missing", async () => {
    mockExistsSync.mockReturnValueOnce(false); // data dir check
    mockExistsSync.mockReturnValueOnce(false); // data file check

    const res = await POST();
    const json = (await res.json()) as { visits: number };

    expect(json.visits).toBe(1);
    expect(mockMkdirSync).toHaveBeenCalled();
  });
});
