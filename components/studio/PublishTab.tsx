"use client";

import type { ProjectItem } from "@/lib/projects";

interface PublishTabProps {
  draft: ProjectItem;
  staticProjectMode: boolean;
  uploading: boolean;
  loading: boolean;
  onFieldChange: (path: keyof ProjectItem, value: unknown) => void;
  onUpload: (file: File) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

export function PublishTab({
  draft,
  staticProjectMode,
  uploading,
  loading,
  onFieldChange,
  onUpload,
  onSaveDraft,
  onPublish,
  onDelete,
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
          <input
            type="file"
            accept="image/*"
            disabled={uploading || loading || staticProjectMode}
            onChange={(e) => {
              if (staticProjectMode) return;
              const file = e.target.files?.[0];
              if (file) {
                onUpload(file);
              }
            }}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 disabled:opacity-50"
          />
          <div className="mt-2 text-xs text-[var(--text-soft)]">
            {staticProjectMode ? "静态模式下已禁用上传，封面请改 `lib/projects.ts`。" : (uploading ? "上传中..." : "上传后自动写入 cover 字段")}
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

      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
        <div className="text-sm text-[var(--text-muted)]">当前可见性：{draft.visibility ?? "draft"}</div>
        <div className="mt-2 text-xs text-[var(--text-soft)]">项目发布状态目前由 `lib/projects.ts` 控制，此页面仅用于查看和临时编辑表单。</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading || staticProjectMode}
          onClick={onSaveDraft}
          className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-2 text-sm text-[var(--warning-text)] transition hover:bg-[var(--warning-soft)] disabled:opacity-50"
        >
          静态模式：不能保存草稿
        </button>

        <button
          type="button"
          disabled={loading || staticProjectMode}
          onClick={onPublish}
          className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--accent-text)] transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
        >
          静态模式：不能发布
        </button>

        <button
          type="button"
          disabled={loading || !draft.slug || staticProjectMode}
          onClick={onDelete}
          className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-2 text-sm text-[var(--danger-text)] transition hover:bg-[var(--danger-soft)] disabled:opacity-50"
        >
          静态模式：不能删除
        </button>
      </div>
    </>
  );
}
