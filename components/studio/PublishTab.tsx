"use client";

import type { ProjectItem } from "@/lib/projects";

interface PublishTabProps {
  draft: ProjectItem;
  uploading: boolean;
  onFieldChange: (path: keyof ProjectItem, value: unknown) => void;
  onUpload: (file: File) => void;
}

export function PublishTab({
  draft,
  uploading,
  onFieldChange,
  onUpload,
}: PublishTabProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">封面图路径</div>
          <input
            value={draft.cover}
            onChange={(e) => onFieldChange("cover", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
          />
          <div className="mt-2 text-xs text-[var(--text-soft)]">支持普通 URL 或 `/api/uploads/xxx`。</div>
        </label>

        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">上传封面图</div>
          {uploading ? (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-3 text-sm text-[var(--text-muted)]">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>上传中...</span>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUpload(file);
                }
              }}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2"
            />
          )}
          <div className="mt-2 text-xs text-[var(--text-soft)]">
            {uploading ? "正在上传并处理封面图" : "上传后自动写入 cover 字段"}
          </div>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">GitHub 地址（可空）</div>
          <input
            value={draft.github}
            onChange={(e) => onFieldChange("github", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">Live 地址（可空）</div>
          <input
            value={draft.live ?? ""}
            onChange={(e) => onFieldChange("live", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">视频链接（可空）</div>
          <input
            value={draft.videoUrl ?? ""}
            onChange={(e) => onFieldChange("videoUrl", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">ETA（可空）</div>
          <input
            value={draft.eta ?? ""}
            onChange={(e) => onFieldChange("eta", e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-[var(--text-muted)]">进度（0-100）</div>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.progress ?? 0}
            onChange={(e) => onFieldChange("progress", Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 outline-none ring-[var(--accent-border)] focus:ring"
          />
        </label>
      </div>
    </>
  );
}
