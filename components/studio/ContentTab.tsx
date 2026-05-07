"use client";

import type { ProjectItem } from "@/lib/projects";

interface ContentTabProps {
  draft: ProjectItem;
  techInput: string;
  onTechInputChange: (value: string) => void;
  onFieldChange: (path: keyof ProjectItem, value: unknown) => void;
}

export function ContentTab({ draft, techInput, onTechInputChange, onFieldChange }: ContentTabProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Summary（中文）</div>
          <textarea
            value={draft.summary.zh}
            onChange={(e) => onFieldChange("summary", { ...draft.summary, zh: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Summary (EN)</div>
          <textarea
            value={draft.summary.en}
            onChange={(e) => onFieldChange("summary", { ...draft.summary, en: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Description（中文）</div>
          <textarea
            value={draft.description.zh}
            onChange={(e) => onFieldChange("description", { ...draft.description, zh: e.target.value })}
            rows={5}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Description (EN)</div>
          <textarea
            value={draft.description.en}
            onChange={(e) => onFieldChange("description", { ...draft.description, en: e.target.value })}
            rows={5}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">项目设计（中文）</div>
          <textarea
            value={draft.design.zh}
            onChange={(e) => onFieldChange("design", { ...draft.design, zh: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Project Design (EN)</div>
          <textarea
            value={draft.design.en}
            onChange={(e) => onFieldChange("design", { ...draft.design, en: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">项目架构（中文）</div>
          <textarea
            value={draft.architecture.zh}
            onChange={(e) => onFieldChange("architecture", { ...draft.architecture, zh: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Architecture (EN)</div>
          <textarea
            value={draft.architecture.en}
            onChange={(e) => onFieldChange("architecture", { ...draft.architecture, en: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-zinc-300">Tech（逗号分隔）</div>
          <input
            value={techInput}
            onChange={(e) => {
              onTechInputChange(e.target.value);
              onFieldChange(
                "tech",
                e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              );
            }}
            className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
          />
        </label>
      </div>
    </>
  );
}
