import "server-only";

import db from "@/lib/db";
import type { SiteContent } from "@/lib/site-content-types";
import { defaultContent } from "@/lib/site-content-types";

const STORAGE_VERSION = 1;

function readPayload(): SiteContent {
  const row = db.prepare(`SELECT json FROM site_content WHERE key = 'main' AND version = ?`).get(STORAGE_VERSION) as { json: string } | undefined;

  if (!row) return structuredClone(defaultContent);

  try {
    const parsed = JSON.parse(row.json) as Partial<SiteContent>;
    return {
      hero: { ...defaultContent.hero, ...parsed.hero },
      about: { ...defaultContent.about, ...parsed.about },
      brand: { ...defaultContent.brand, ...parsed.brand },
      footer: { ...defaultContent.footer, ...parsed.footer },
    };
  } catch {
    return structuredClone(defaultContent);
  }
}

export function getContent(): SiteContent {
  return structuredClone(readPayload());
}

export function setContent(content: SiteContent): void {
  const json = JSON.stringify(content);
  const now = Date.now();

  db.prepare(`
    INSERT INTO site_content (key, version, json, updated_at)
    VALUES ('main', ?, ?, ?)
    ON CONFLICT(key)
    DO UPDATE SET version = excluded.version, json = excluded.json, updated_at = excluded.updated_at
  `).run(STORAGE_VERSION, json, now);
}
