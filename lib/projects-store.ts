import "server-only";

import db from "@/lib/db";
import { cloneLocalProjects, type ProjectItem } from "@/lib/projects";

type ProjectRow = { data: string };
type CreatedAtRow = { created_at: number };

let seeded = false;

function seedFromStatic(): void {
  const projects = cloneLocalProjects();
  const now = Date.now();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO projects (slug, data, created_at, updated_at) VALUES (?, ?, ?, ?)`
  );
  const tx = db.transaction(() => {
    for (const project of projects) {
      insert.run(project.slug, JSON.stringify(project), project.publishedAt ?? now, now);
    }
  });
  tx();
}

function ensureSeeded(): void {
  if (seeded) return;
  const count = db.prepare("SELECT COUNT(*) AS c FROM projects").get() as { c: number };
  if (count.c === 0) {
    seedFromStatic();
  }
  seeded = true;
}

export function getAllProjects(): ProjectItem[] {
  ensureSeeded();
  const rows = db.prepare("SELECT data FROM projects ORDER BY updated_at DESC").all() as ProjectRow[];
  return rows.map((r) => JSON.parse(r.data) as ProjectItem);
}

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  ensureSeeded();
  const row = db.prepare("SELECT data FROM projects WHERE slug = ?").get(slug) as ProjectRow | undefined;
  return row ? (JSON.parse(row.data) as ProjectItem) : undefined;
}

export function upsertProject(project: ProjectItem): void {
  const now = Date.now();
  const existing = db.prepare("SELECT created_at FROM projects WHERE slug = ?").get(project.slug) as CreatedAtRow | undefined;

  const record = { ...project, updatedAt: now };
  if (!existing) {
    record.publishedAt = project.publishedAt ?? now;
  }

  db.prepare(
    `INSERT OR REPLACE INTO projects (slug, data, created_at, updated_at) VALUES (?, ?, ?, ?)`
  ).run(project.slug, JSON.stringify(record), existing?.created_at ?? now, now);
}

export function deleteProject(slug: string): void {
  db.prepare("DELETE FROM projects WHERE slug = ?").run(slug);
}

export function seedProjects(): number {
  const projects = cloneLocalProjects();
  const now = Date.now();
  const insert = db.prepare(
    `INSERT OR REPLACE INTO projects (slug, data, created_at, updated_at) VALUES (?, ?, ?, ?)`
  );
  const tx = db.transaction(() => {
    for (const project of projects) {
      insert.run(project.slug, JSON.stringify(project), project.publishedAt ?? now, now);
    }
  });
  tx();
  return projects.length;
}
