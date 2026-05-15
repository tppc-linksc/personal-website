import { describe, it, expect, beforeEach, vi } from "vitest";

const mockDbPrepare = vi.fn();
const mockDbGet = vi.fn();
const mockDbAll = vi.fn();
const mockDbRun = vi.fn();
const mockDbExec = vi.fn();
const mockDbPragma = vi.fn();
const mockDbTransaction = vi.fn();

const mockStatement = {
  get: (...args: unknown[]) => mockDbGet(...args),
  all: (...args: unknown[]) => mockDbAll(...args),
  run: (...args: unknown[]) => mockDbRun(...args),
};

mockDbPrepare.mockReturnValue(mockStatement);
mockDbTransaction.mockImplementation((fn: () => void) => fn());

vi.mock("@/lib/db", () => ({
  default: {
    prepare: (...args: unknown[]) => mockDbPrepare(...args),
    exec: (...args: unknown[]) => mockDbExec(...args),
    pragma: (...args: unknown[]) => mockDbPragma(...args),
    transaction: (...args: unknown[]) => mockDbTransaction(...args),
  },
}));

import { GET, POST } from "@/app/api/metrics/visits/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockDbPrepare.mockReturnValue(mockStatement);
});

describe("GET /api/metrics/visits", () => {
  it("returns visit count with no-store cache header", async () => {
    mockDbGet.mockReturnValue({ value: 42 });

    const res = await GET();
    const json = (await res.json()) as { visits: number; enabled: boolean };

    expect(res.status).toBe(200);
    expect(json.visits).toBe(42);
    expect(json.enabled).toBe(true);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 0 when no data in database", async () => {
    mockDbGet.mockReturnValue(undefined);

    const res = await GET();
    const json = (await res.json()) as { visits: number };

    expect(json.visits).toBe(0);
  });
});

describe("POST /api/metrics/visits", () => {
  it("increments visit count", async () => {
    mockDbGet.mockReturnValue({ value: 43 });

    const res = await POST();
    const json = (await res.json()) as { visits: number };

    expect(res.status).toBe(200);
    expect(json.visits).toBe(43);
  });

  it("returns 0 when upsert returns no row", async () => {
    mockDbGet.mockReturnValue(undefined);

    const res = await POST();
    const json = (await res.json()) as { visits: number };

    expect(json.visits).toBe(0);
  });
});
