"use client";

import type { ProjectItem } from "@/lib/projects";

interface BasicTabProps {
  draft: ProjectItem;
  onFieldChange: (path: keyof ProjectItem, value: unknown) => void;
}

export function BasicTab({ draft, onFieldChange }: BasicTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm">
        <div className="mb-1 text-[var(--text-muted)]">Slug</div>
        <input
          value={draft.slug}
          onChange={(e) => onFieldChange("slug", e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        />
      </label>

      <label className="text-sm">
        <div className="mb-1 text-[var(--text-muted)]">项目状态</div>
        <select
          value={draft.status}
          onChange={(e) => onFieldChange("status", e.target.value as ProjectItem["status"])}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        >
          <option value="live">live</option>
          <option value="completed">completed</option>
          <option value="in_progress">in_progress</option>
          <option value="planned">planned</option>
          <option value="paused">paused</option>
        </select>
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm md:col-span-2">
        <input
          type="checkbox"
          checked={Boolean(draft.defaultFeatured)}
          onChange={(e) => onFieldChange("defaultFeatured", e.target.checked)}
          className="h-4 w-4"
        />
        <span>
          默认精选补位
          <span className="ml-2 text-xs text-[var(--text-soft)]">高星项目不足 3 个时用于首页补位</span>
        </span>
      </label>

      <label className="text-sm">
        <div className="mb-1 text-[var(--text-muted)]">项目名称（中文）</div>
        <input
          value={draft.title.zh}
          onChange={(e) => onFieldChange("title", { ...draft.title, zh: e.target.value })}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        />
      </label>

      <label className="text-sm">
        <div className="mb-1 text-[var(--text-muted)]">Project Name (EN)</div>
        <input
          value={draft.title.en}
          onChange={(e) => onFieldChange("title", { ...draft.title, en: e.target.value })}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        />
      </label>

      <label className="text-sm">
        <div className="mb-1 text-[var(--text-muted)]">Tagline（中文）</div>
        <input
          value={draft.tagline.zh}
          onChange={(e) => onFieldChange("tagline", { ...draft.tagline, zh: e.target.value })}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        />
      </label>

      <label className="text-sm">
        <div className="mb-1 text-[var(--text-muted)]">Tagline (EN)</div>
        <input
          value={draft.tagline.en}
          onChange={(e) => onFieldChange("tagline", { ...draft.tagline, en: e.target.value })}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        />
      </label>

      <label className="text-sm md:col-span-2">
        <div className="mb-1 text-[var(--text-muted)]">项目开始时间</div>
        <input
          type="date"
          value={draft.startDate ?? ""}
          onChange={(e) => onFieldChange("startDate", e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
        />
        <div className="mt-2 text-xs text-[var(--text-soft)]">用于首页项目路线排序和日期显示</div>
      </label>
    </div>
  );
}
