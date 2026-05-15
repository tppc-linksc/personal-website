"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectItem } from "@/lib/projects";
import { ProjectList } from "@/components/studio/ProjectList";
import { BasicTab } from "@/components/studio/BasicTab";
import { ContentTab } from "@/components/studio/ContentTab";
import { PublishTab } from "@/components/studio/PublishTab";

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
  startDate: "",
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
type MessageType = "success" | "error";

export default function StudioPage() {
  const [studioAuthorized, setStudioAuthorized] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [draft, setDraft] = useState<ProjectItem>(cloneProject(emptyProject));
  const [techInput, setTechInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [tab, setTab] = useState<StudioTab>("basic");
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // when selectedSlug changes, sync draft from projects list
  useEffect(() => {
    if (!selectedSlug) {
      setDraft(cloneProject(emptyProject));
      setTechInput("");
      return;
    }
    const found = projects.find((p) => p.slug === selectedSlug);
    if (found) {
      const copy = cloneProject(found);
      setDraft(copy);
      setTechInput(copy.tech.join(", "));
    }
  }, [selectedSlug, projects]);

  function showMessage(text: string, type: MessageType = "success", duration = 4000) {
    if (messageTimer.current) clearTimeout(messageTimer.current);
    setMessage(text);
    setMessageType(type);
    messageTimer.current = setTimeout(() => {
      setMessage(null);
      messageTimer.current = null;
    }, duration);
  }

  function selectProject(project: ProjectItem) {
    setSelectedSlug(project.slug);
  }

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects?scope=all", { cache: "no-store" });
      const json = (await res.json()) as {
        projects?: ProjectItem[];
        studioAuthorized?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "加载失败");
      }

      const list = json.projects ?? [];
      setStudioAuthorized(Boolean(json.studioAuthorized));
      setProjects(list);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "加载失败", "error");
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);

  async function postAction(payload: Record<string, unknown>, reloadAfter?: boolean) {
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "操作失败");
      }
      showMessage(json.message ?? "操作成功", "success");

      if (reloadAfter) {
        await loadProjects();
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "操作失败", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveDraft() {
    void postAction(
      { action: "upsert", project: { ...draft, visibility: "draft" } },
      true
    );
  }

  function handlePublish() {
    void postAction(
      { action: "upsert", project: { ...draft, visibility: "published" } },
      true
    );
  }

  function handleDelete() {
    const slug = draft.slug;
    if (!slug) return;
    void postAction(
      { action: "delete", slug },
      true
    );
    setSelectedSlug("");
  }

  function handleSeed() {
    void postAction({ action: "seed" }, true);
  }

  function handleNewProject() {
    setSelectedSlug("");
    setTab("basic");
  }

  async function uploadCover(file: File) {
    setUploading(true);

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

      const uploadedCover: string = json.cover;
      setDraft((prev) => ({ ...prev, cover: uploadedCover }));
      showMessage("封面上传成功，已写入 cover 字段", "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "上传失败", "error");
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

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {message && (
          <div
            className={`pointer-events-auto fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-xl border px-5 py-3 text-sm shadow-lg backdrop-blur-md ${
              messageType === "success"
                ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-text)]"
                : "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-text)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{messageType === "success" ? "✓" : "✕"}</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        <header className="surface-panel rounded-2xl p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Studio · 项目管理</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">项目数据已持久化到 SQLite，支持在 Studio 中直接创建、编辑和发布。</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-xl border shadow-sm border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
            >
              退出登录
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleSeed()}
              className="rounded-xl border shadow-sm border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-2 text-sm transition hover:border-[var(--accent)] disabled:opacity-50"
            >
              从静态数据导入
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleNewProject}
              className="rounded-xl border shadow-sm border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-2 text-sm transition hover:border-[var(--accent)] disabled:opacity-50"
            >
              新建项目
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-soft)]">
            <div>Studio 会话：{studioAuthorized ? "已授权" : "未授权"}</div>
          </div>

        </header>

        <div className="grid gap-6 md:grid-cols-[320px,1fr]">
          <div className="flex flex-col gap-4">
            <ProjectList
              projects={projects}
              selectedSlug={selectedSlug}
              filter={filter}
              onFilterChange={setFilter}
              onSelect={selectProject}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading || uploading}
                onClick={handleSaveDraft}
                className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-2 text-sm text-[var(--warning-text)] transition disabled:opacity-50"
              >
                {loading ? "保存中..." : "保存草稿"}
              </button>
              <button
                type="button"
                disabled={loading || uploading}
                onClick={handlePublish}
                className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--accent-text)] transition disabled:opacity-50"
              >
                {loading ? "发布中..." : "发布项目"}
              </button>
              {selectedSlug && (
                <button
                  type="button"
                  disabled={loading || uploading}
                  onClick={handleDelete}
                  className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-2 text-sm text-[var(--danger-text)] transition disabled:opacity-50"
                >
                  {loading ? "删除中..." : "删除项目"}
                </button>
              )}
            </div>
          </div>

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
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-text)]"
                      : "shadow-sm border-[var(--line-muted)] bg-[var(--button-bg)] text-[var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "basic" && <BasicTab draft={draft} onFieldChange={applyField} />}

            {tab === "content" && (
              <ContentTab
                draft={draft}
                techInput={techInput}
                onTechInputChange={setTechInput}
                onFieldChange={applyField}
              />
            )}

            {tab === "publish" && (
              <PublishTab
                draft={draft}
                uploading={uploading}
                onFieldChange={applyField}
                onUpload={(file) => void uploadCover(file)}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
