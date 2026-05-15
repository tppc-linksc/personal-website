#!/usr/bin/env node

/**
 * 将现有 data/*.json 数据迁移到 SQLite。
 * 可重复执行，使用 upsert 避免重复导入。
 */

import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DATA_DIR = process.env.PORTFOLIO_DATA_DIR || join(root, "data");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = join(DATA_DIR, "portfolio.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");
db.pragma("foreign_keys = ON");

db.exec(`
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
`);

function migrateRateLimitsSchema() {
  const columns = db.prepare("PRAGMA table_info(rate_limits)").all();
  const hasId = columns.some((column) => column.name === "id");
  if (hasId) return;

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

function readJson(path) {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, "utf-8"));
    }
  } catch { /* ignore */ }
  return null;
}

// --- messages ---
const messagesPath = join(root, "data", "messages.json");
const messagesData = readJson(messagesPath);
if (Array.isArray(messagesData)) {
  const insert = db.prepare(`
    INSERT INTO messages (id, project_slug, parent_id, author_type, nickname, content, status, created_at)
    VALUES (@id, @projectSlug, @parentId, @authorType, @nickname, @content, @status, @createdAt)
    ON CONFLICT(id) DO UPDATE SET
      project_slug = excluded.project_slug,
      parent_id = excluded.parent_id,
      author_type = excluded.author_type,
      nickname = excluded.nickname,
      content = excluded.content,
      status = excluded.status,
      created_at = excluded.created_at
  `);

  const insertAll = db.transaction((items) => {
    for (const item of items) {
      insert.run({
        id: item.id,
        projectSlug: item.projectSlug,
        parentId: item.parentId || null,
        authorType: item.authorType,
        nickname: item.nickname,
        content: item.content,
        status: item.status,
        createdAt: item.createdAt,
      });
    }
  });

  insertAll(messagesData);
  console.log(`  messages: imported ${messagesData.length} rows`);
} else {
  console.log("  messages: no data to import");
}

// --- visits → metrics ---
const visitsPath = join(root, "data", "visits.json");
const visitsData = readJson(visitsPath);
if (visitsData && typeof visitsData.visits === "number") {
  db.prepare(`
    INSERT INTO metrics (key, value, updated_at)
    VALUES ('visits', ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `).run(visitsData.visits, Date.now());
  console.log("  metrics: imported visits =", visitsData.visits);
} else {
  console.log("  metrics: no data to import");
}

// --- site-content ---
const siteContentPath = join(root, "data", "site-content.json");
const siteContentData = readJson(siteContentPath);
if (siteContentData?.data) {
  db.prepare(`
    INSERT INTO site_content (key, version, json, updated_at)
    VALUES ('main', ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      version = excluded.version,
      json = excluded.json,
      updated_at = excluded.updated_at
  `).run(siteContentData.__version || 1, JSON.stringify(siteContentData.data), Date.now());
  console.log("  site_content: imported");
} else {
  console.log("  site_content: no data to import");
}

// --- rate-limits ---
const rateLimitsPath = join(root, "data", "rate-limits.json");
const rateLimitsData = readJson(rateLimitsPath);
if (rateLimitsData && typeof rateLimitsData === "object" && !Array.isArray(rateLimitsData)) {
  const insert = db.prepare(`
    INSERT INTO rate_limits (key, bucket, created_at)
    VALUES (?, 'default', ?)
  `);

  const insertAll = db.transaction((store) => {
    db.prepare("DELETE FROM rate_limits WHERE bucket = 'default'").run();
    for (const [key, timestamps] of Object.entries(store)) {
      if (Array.isArray(timestamps)) {
        for (const ts of timestamps) {
          if (typeof ts === "number") {
            insert.run(key, ts);
          }
        }
      }
    }
  });

  insertAll(rateLimitsData);
  const count = db.prepare("SELECT COUNT(*) AS c FROM rate_limits").get();
  console.log("  rate_limits: imported", count?.c, "records");
} else {
  console.log("  rate_limits: no data to import");
}

console.log("\nMigration complete. Database:", dbPath);

const stats = {
  messages: db.prepare("SELECT COUNT(*) AS c FROM messages").get()?.c,
  metrics: db.prepare("SELECT value FROM metrics WHERE key = 'visits'").get()?.value,
  site_content: Boolean(db.prepare("SELECT 1 FROM site_content WHERE key = 'main'").get()),
  rate_limits: db.prepare("SELECT COUNT(*) AS c FROM rate_limits").get()?.c,
};

console.log("Summary:", JSON.stringify(stats, null, 2));

db.close();
