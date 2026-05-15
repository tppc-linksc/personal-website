"use client";

import type { ProjectItem } from "@/lib/projects";

type VisibilityFilter = "all" | "draft" | "published";

interface ProjectListProps {
  projects: ProjectItem[];
  selectedSlug: string;
  filter: VisibilityFilter;
  onFilterChange: (filter: VisibilityFilter) => void;
  onSelect: (project: ProjectItem) => void;
}

export function ProjectList({ projects, selectedSlug, filter, onFilterChange, onSelect }: ProjectListProps) {
  const filtered = filter === "all" ? projects : projects.filter((item) => (item.visibility ?? "published") === filter);

  return (
    <aside className="surface-panel rounded-2xl p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">项目列表</span>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as VisibilityFilter)}
          className="rounded-lg border border-[var(--line)] bg-[var(--button-bg)] px-2 py-1 text-xs"
        >
          <option value="all">全部</option>
          <option value="draft">仅草稿</option>
          <option value="published">仅已发布</option>
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
              selectedSlug === item.slug
                ? "border-[var(--accent-border)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-[var(--panel-soft)] hover:border-[var(--text-muted)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{item.title.zh || item.slug}</div>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  (item.visibility ?? "published") === "draft"
                    ? "bg-[var(--warning-soft)] text-[var(--warning-text)]"
                    : "bg-[var(--success-soft)] text-[var(--success-text)]"
                }`}
              >
                {item.visibility ?? "published"}
              </span>
            </div>
            <div className="mt-1 text-xs text-[var(--text-soft)]">{item.status}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}
