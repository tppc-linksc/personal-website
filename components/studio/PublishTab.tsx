"use client";

import type { ProjectItem } from "@/lib/projects";

interface PublishTabProps {
  draft: ProjectItem;
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
          <div className="mb-1 text-zinc-300">封面图路径</div>
          <input
            value={draft.cover}
            onChange={(e) => onFieldChange("cover", e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
          <div className="mt-2 text-xs text-zinc-400">支持普通 URL 或 `cloud://fileID`。</div>
        </label>

        <label className="text-sm">
          <div className="mb-1 text-zinc-300">上传封面图</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUpload(file);
              }
            }}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2"
          />
          <div className="mt-2 text-xs text-zinc-400">{uploading ? "上传中..." : "上传后自动写入 cover 字段"}</div>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">GitHub 地址（可空）</div>
          <input
            value={draft.github}
            onChange={(e) => onFieldChange("github", e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Live 地址（可空）</div>
          <input
            value={draft.live ?? ""}
            onChange={(e) => onFieldChange("live", e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">视频链接（可空）</div>
          <input
            value={draft.videoUrl ?? ""}
            onChange={(e) => onFieldChange("videoUrl", e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">ETA（可空）</div>
          <input
            value={draft.eta ?? ""}
            onChange={(e) => onFieldChange("eta", e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">进度（0-100）</div>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.progress ?? 0}
            onChange={(e) => onFieldChange("progress", Number(e.target.value))}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm text-zinc-300">当前可见性：{draft.visibility ?? "draft"}</div>
        <div className="mt-2 text-xs text-zinc-400">`draft` 不会出现在前台，`published` 会在前台展示。</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={onSaveDraft}
          className="rounded-xl border border-amber-300/60 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-50"
        >
          保存草稿
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onPublish}
          className="rounded-xl border border-cyan-300/70 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-50"
        >
          发布上线
        </button>

        <button
          type="button"
          disabled={loading || !draft.slug}
          onClick={onDelete}
          className="rounded-xl border border-red-300/55 bg-red-300/10 px-4 py-2 text-sm text-red-100 transition hover:bg-red-300/20 disabled:opacity-50"
        >
          删除项目
        </button>
      </div>
    </>
  );
}
