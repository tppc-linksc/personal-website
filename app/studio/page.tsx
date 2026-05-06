"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProjectItem } from "@/lib/projects";

const emptyProject: ProjectItem = {
  slug: "",
  status: "planned",
  visibility: "draft",
  defaultFeatured: false,
  title: { zh: "", en: "" },
  tagline: { zh: "", en: "" },
  summary: { zh: "", en: "" },
  description: { zh: "", en: "" },
  design: { zh: "", en: "" },
  architecture: { zh: "", en: "" },
  cover: "/projects/your-cover.svg",
  eta: "",
  progress: 0,
  tech: [],
  github: "",
  live: "",
  videoUrl: "",
  updatedAt: Date.now(),
};

function cloneProject(project: ProjectItem): ProjectItem {
  return {
    ...project,
    visibility: project.visibility ?? "draft",
    defaultFeatured: Boolean(project.defaultFeatured),
    title: { ...project.title },
    tagline: { ...project.tagline },
    summary: { ...project.summary },
    description: { ...project.description },
    design: { ...project.design },
    architecture: { ...project.architecture },
    tech: [...project.tech],
  };
}

type StudioTab = "basic" | "content" | "publish";
type VisibilityFilter = "all" | "draft" | "published";

export default function StudioPage() {
  const [cloudbaseEnabled, setCloudbaseEnabled] = useState(false);
  const [studioAuthorized, setStudioAuthorized] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [draft, setDraft] = useState<ProjectItem>(cloneProject(emptyProject));
  const [techInput, setTechInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<StudioTab>("basic");
  const [filter, setFilter] = useState<VisibilityFilter>("all");

  function selectProject(project: ProjectItem) {
    setSelectedSlug(project.slug);
    const copy = cloneProject(project);
    setDraft(copy);
    setTechInput(copy.tech.join(", "));
  }

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/projects?scope=all", { cache: "no-store" });
      const json = (await res.json()) as {
        projects?: ProjectItem[];
        cloudbaseEnabled?: boolean;
        studioAuthorized?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "加载失败");
      }

      const list = json.projects ?? [];
      setCloudbaseEnabled(Boolean(json.cloudbaseEnabled));
      setStudioAuthorized(Boolean(json.studioAuthorized));
      setProjects(list);

      if (list.length > 0) {
        setSelectedSlug((prev) => {
          const keep = prev ? list.find((item) => item.slug === prev) : undefined;
          const target = keep ?? list[0];
          const copy = cloneProject(target);
          setDraft(copy);
          setTechInput(copy.tech.join(", "));
          return target.slug;
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjects();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loadProjects]);

  async function postAction(payload: Record<string, unknown>, successMessage = "保存成功") {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "操作失败");
      }
      await loadProjects();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/studio/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { cover?: string; tempUrl?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "上传失败");
      }

      if (!json.cover) {
        throw new Error("上传返回数据异常");
      }

      applyField("cover", json.cover);
      setMessage("封面上传成功，记得点击保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/studio/session", { method: "DELETE" });
    } finally {
      window.location.href = "/studio/login";
    }
  }

  function applyField(path: keyof ProjectItem, value: unknown) {
    setDraft((prev) => ({ ...prev, [path]: value }));
  }

  const filteredProjects = useMemo(() => {
    if (filter === "all") {
      return projects;
    }
    return projects.filter((item) => (item.visibility ?? "published") === filter);
  }, [filter, projects]);

  return (
    <main className="min-h-screen bg-[#070913] px-4 py-6 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="surface-panel rounded-2xl p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Studio · 项目管理</h1>
              <p className="mt-2 text-sm text-zinc-300">三段式 CMS：分组表单、封面上传、草稿发布。保存后前台自动读取最新数据。</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:border-cyan-300/70"
            >
              退出登录
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void postAction({ action: "seed" }, "示例数据已初始化")}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:border-cyan-300/70"
            >
              初始化示例数据
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSlug("");
                setDraft(cloneProject(emptyProject));
                setTechInput("");
                setTab("basic");
              }}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:border-cyan-300/70"
            >
              新建项目
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
            <div>CloudBase：{cloudbaseEnabled ? "已配置" : "未配置（当前仅本地兜底）"}</div>
            <div>Studio 会话：{studioAuthorized ? "已授权" : "未授权"}</div>
          </div>
          {message && <div className="mt-2 text-sm text-cyan-200">{message}</div>}
        </header>

        <div className="grid gap-6 md:grid-cols-[320px,1fr]">
          <aside className="surface-panel rounded-2xl p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-zinc-300">项目列表</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as VisibilityFilter)}
                className="rounded-lg border border-white/15 bg-black/25 px-2 py-1 text-xs"
              >
                <option value="all">全部</option>
                <option value="draft">仅草稿</option>
                <option value="published">仅已发布</option>
              </select>
            </div>
            <div className="space-y-2">
              {filteredProjects.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => selectProject(item)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedSlug === item.slug
                      ? "border-cyan-300/70 bg-cyan-300/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{item.title.zh || item.slug}</div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        (item.visibility ?? "published") === "draft"
                          ? "bg-amber-300/20 text-amber-200"
                          : "bg-emerald-300/20 text-emerald-200"
                      }`}
                    >
                      {item.visibility ?? "published"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">{item.status}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="surface-panel rounded-2xl p-4 md:p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                { key: "basic", label: "1) 基础信息" },
                { key: "content", label: "2) 内容信息" },
                { key: "publish", label: "3) 发布信息" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key as StudioTab)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    tab === item.key
                      ? "border-cyan-300/70 bg-cyan-300/10 text-cyan-100"
                      : "border-white/15 bg-white/[0.03] text-zinc-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "basic" && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <div className="mb-1 text-zinc-300">Slug</div>
                  <input
                    value={draft.slug}
                    onChange={(e) => applyField("slug", e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-zinc-300">项目状态</div>
                  <select
                    value={draft.status}
                    onChange={(e) => applyField("status", e.target.value as ProjectItem["status"])}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                  >
                    <option value="live">live</option>
                    <option value="completed">completed</option>
                    <option value="in_progress">in_progress</option>
                    <option value="planned">planned</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.defaultFeatured)}
                    onChange={(e) => applyField("defaultFeatured", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>
                    默认精选补位
                    <span className="ml-2 text-xs text-zinc-400">高星项目不足 3 个时用于首页补位</span>
                  </span>
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-zinc-300">项目名称（中文）</div>
                  <input
                    value={draft.title.zh}
                    onChange={(e) => applyField("title", { ...draft.title, zh: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-zinc-300">Project Name (EN)</div>
                  <input
                    value={draft.title.en}
                    onChange={(e) => applyField("title", { ...draft.title, en: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-zinc-300">Tagline（中文）</div>
                  <input
                    value={draft.tagline.zh}
                    onChange={(e) => applyField("tagline", { ...draft.tagline, zh: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-zinc-300">Tagline (EN)</div>
                  <input
                    value={draft.tagline.en}
                    onChange={(e) => applyField("tagline", { ...draft.tagline, en: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                  />
                </label>
              </div>
            )}

            {tab === "content" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">Summary（中文）</div>
                    <textarea
                      value={draft.summary.zh}
                      onChange={(e) => applyField("summary", { ...draft.summary, zh: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">Summary (EN)</div>
                    <textarea
                      value={draft.summary.en}
                      onChange={(e) => applyField("summary", { ...draft.summary, en: e.target.value })}
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
                      onChange={(e) => applyField("description", { ...draft.description, zh: e.target.value })}
                      rows={5}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">Description (EN)</div>
                    <textarea
                      value={draft.description.en}
                      onChange={(e) => applyField("description", { ...draft.description, en: e.target.value })}
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
                      onChange={(e) => applyField("design", { ...draft.design, zh: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">Project Design (EN)</div>
                    <textarea
                      value={draft.design.en}
                      onChange={(e) => applyField("design", { ...draft.design, en: e.target.value })}
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
                      onChange={(e) => applyField("architecture", { ...draft.architecture, zh: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">Architecture (EN)</div>
                    <textarea
                      value={draft.architecture.en}
                      onChange={(e) => applyField("architecture", { ...draft.architecture, en: e.target.value })}
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
                        setTechInput(e.target.value);
                        applyField(
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
            )}

            {tab === "publish" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">封面图路径</div>
                    <input
                      value={draft.cover}
                      onChange={(e) => applyField("cover", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                    <div className="mt-2 text-xs text-zinc-400">支持普通 URL 或 `cloud://fileID`。</div>
                  </label>

                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">上传封面图（CloudBase）</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadCover(file);
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
                      onChange={(e) => applyField("github", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">Live 地址（可空）</div>
                    <input
                      value={draft.live ?? ""}
                      onChange={(e) => applyField("live", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">视频链接（可空）</div>
                    <input
                      value={draft.videoUrl ?? ""}
                      onChange={(e) => applyField("videoUrl", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 outline-none ring-cyan-300/60 focus:ring"
                    />
                  </label>
                  <label className="text-sm">
                    <div className="mb-1 text-zinc-300">ETA（可空）</div>
                    <input
                      value={draft.eta ?? ""}
                      onChange={(e) => applyField("eta", e.target.value)}
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
                      onChange={(e) => applyField("progress", Number(e.target.value))}
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
                    onClick={() =>
                      void postAction(
                        {
                          action: "upsert",
                          project: { ...draft, visibility: "draft" },
                        },
                        "草稿已保存"
                      )
                    }
                    className="rounded-xl border border-amber-300/60 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-50"
                  >
                    保存草稿
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void postAction(
                        {
                          action: "upsert",
                          project: { ...draft, visibility: "published" },
                        },
                        "项目已发布"
                      )
                    }
                    className="rounded-xl border border-cyan-300/70 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-50"
                  >
                    发布上线
                  </button>

                  <button
                    type="button"
                    disabled={loading || !draft.slug}
                    onClick={() => void postAction({ action: "delete", slug: draft.slug }, "项目已删除")}
                    className="rounded-xl border border-red-300/55 bg-red-300/10 px-4 py-2 text-sm text-red-100 transition hover:bg-red-300/20 disabled:opacity-50"
                  >
                    删除项目
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
