import "server-only";

import db from "@/lib/db";

const cleanupStmt = db.prepare(`DELETE FROM rate_limits WHERE bucket = ? AND key = ? AND created_at < ?`);
const countStmt = db.prepare(`SELECT COUNT(*) AS count FROM rate_limits WHERE bucket = ? AND key = ? AND created_at >= ?`);
const insertStmt = db.prepare(`INSERT INTO rate_limits (key, bucket, created_at) VALUES (?, ?, ?)`);

const checkAndInsert = db.transaction((key: string, limit: number, cutoff: number, bucket: string, now: number) => {
  cleanupStmt.run(bucket, key, cutoff);
  const count = countStmt.get(bucket, key, cutoff) as { count: number };

  if (count.count >= limit) {
    return true;
  }

  insertStmt.run(key, bucket, now);
  return false;
});

export function isRateLimited(key: string, limit: number, windowMs: number, bucket = "default"): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  return checkAndInsert(key, limit, cutoff, bucket, now);
}
