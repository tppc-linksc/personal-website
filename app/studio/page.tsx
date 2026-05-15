"use client";

import { useCallback, useEffect, useState } from "react";
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
const STATIC_PROJECT_MODE = true;

export default function StudioPage() {
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
        studioAuthorized?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "加载失败");
      }

      const list = json.projects ?? [];
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

    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        void loadProjects();
      }
    }
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [loadProjects]);

  async function postAction(payload: Record<string, unknown>) {
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
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "操作失败");
      }
      setMessage(json.message ?? "操作成功");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCover(file: File) {
    if (STATIC_PROJECT_MODE) {
      setMessage("静态模式下已禁用上传，请在 lib/projects.ts 中手动填写封面路径");
      return;
    }

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
      setMessage("封面上传成功，已写入 cover 字段");
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

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="surface-panel rounded-2xl p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Studio · 项目管理</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">项目数据当前为只读静态模式，请直接修改 lib/projects.ts 后重新部署。</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
            >
              退出登录
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              onClick={() => void postAction({ action: "seed" })}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm opacity-50"
            >
              示例数据由代码维护
            </button>
            <button
              type="button"
              disabled
              onClick={() => {
                setSelectedSlug("");
                setDraft(cloneProject(emptyProject));
                setTechInput("");
                setTab("basic");
              }}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm opacity-50"
            >
              新建项目需改代码
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-soft)]">
            <div>Studio 会话：{studioAuthorized ? "已授权" : "未授权"}</div>
          </div>
          {message && <div className="mt-2 text-sm text-[var(--accent-text)]">{message}</div>}
        </header>

        <div className="grid gap-6 md:grid-cols-[320px,1fr]">
          <ProjectList
            projects={projects}
            selectedSlug={selectedSlug}
            filter={filter}
            onFilterChange={setFilter}
            onSelect={selectProject}
          />

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
                      : "border-[var(--line)] bg-[var(--panel-soft)] text-[var(--text-muted)]"
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
                staticProjectMode={STATIC_PROJECT_MODE}
                uploading={uploading}
                loading={loading}
                onFieldChange={applyField}
                onUpload={(file) => void uploadCover(file)}
                onSaveDraft={() => void postAction({ action: "upsert", project: { ...draft, visibility: "draft" } })}
                onPublish={() => void postAction({ action: "upsert", project: { ...draft, visibility: "published" } })}
                onDelete={() => void postAction({ action: "delete", slug: draft.slug })}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
