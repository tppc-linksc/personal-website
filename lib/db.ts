import "server-only";

import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import Database from "better-sqlite3";

function resolveDbPath(): string {
  const envDir = process.env.PORTFOLIO_DATA_DIR;
  if (envDir) {
    return join(/*turbopackIgnore: true*/ envDir, "portfolio.sqlite");
  }
  return join(process.cwd(), "data", "portfolio.sqlite");
}

const dbPath = resolveDbPath();
const DATA_DIR = dirname(dbPath);

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 30000");
db.pragma("foreign_keys = ON");

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    project_slug TEXT NOT NULL,
    parent_id TEXT,
    author_type TEXT NOT NULL CHECK (author_type IN ('guest', 'owner')),
    nickname TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'hidden')),
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_project_status_created
    ON messages (project_slug, status, created_at);

  CREATE INDEX IF NOT EXISTS idx_messages_project_parent
    ON messages (project_slug, parent_id);

  CREATE TABLE IF NOT EXISTS metrics (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    version INTEGER NOT NULL,
    json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    bucket TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_rate_limits_key_bucket_created
    ON rate_limits (key, bucket, created_at);

  CREATE TABLE IF NOT EXISTS projects (
    slug TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

function initSchema(): void {
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      db.exec(SCHEMA_SQL);
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < 9 && msg.includes("SQLITE_BUSY")) {
        const delay = Math.min(50 * Math.pow(2, attempt), 2000);
        const end = Date.now() + delay;
        while (Date.now() < end) { /* spin-wait */ }
        continue;
      }
      throw err;
    }
  }
}

initSchema();

function migrateRateLimitsSchema(): void {
  const columns = db.prepare("PRAGMA table_info(rate_limits)").all() as Array<{ name: string }>;
  const hasId = columns.some((column) => column.name === "id");
  if (hasId) {
    return;
  }

  db.exec(`
    ALTER TABLE rate_limits RENAME TO rate_limits_legacy;

    CREATE TABLE rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      bucket TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    INSERT INTO rate_limits (key, bucket, created_at)
    SELECT key, bucket, created_at FROM rate_limits_legacy;

    DROP TABLE rate_limits_legacy;

    CREATE INDEX IF NOT EXISTS idx_rate_limits_key_bucket_created
      ON rate_limits (key, bucket, created_at);
  `);
}

migrateRateLimitsSchema();

export default db;
