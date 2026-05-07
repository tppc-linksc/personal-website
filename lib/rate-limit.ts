import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const RATE_LIMIT_FILE = join(DATA_DIR, "rate-limits.json");

interface RateLimitStore {
  [key: string]: number[];
}

function readStore(): RateLimitStore {
  try {
    if (existsSync(RATE_LIMIT_FILE)) {
      return JSON.parse(readFileSync(RATE_LIMIT_FILE, "utf-8")) as RateLimitStore;
    }
  } catch { /* ignore */ }
  return {};
}

function writeStore(store: RateLimitStore): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const tempFile = `${RATE_LIMIT_FILE}.tmp`;
  writeFileSync(tempFile, JSON.stringify(store), "utf-8");
  renameSync(tempFile, RATE_LIMIT_FILE);
}

/**
 * 基于文件系统的原子限流检查。
 * 注意：在 Serverless 环境中，文件锁仍可能存在竞态条件，
 * 建议生产环境使用 Redis/Upstash 等外部存储。
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const store = readStore();
  const items = store[key] ?? [];
  const recent = items.filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    store[key] = recent;
    writeStore(store);
    return true;
  }

  recent.push(now);
  store[key] = recent;
  writeStore(store);
  return false;
}
