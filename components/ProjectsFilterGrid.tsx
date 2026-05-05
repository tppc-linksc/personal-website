"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import type { Dictionary, Locale } from "@/lib/i18n";
import { projectStatusOrder } from "@/lib/project-selection";
import type { ProjectItem, ProjectStatus } from "@/lib/projects";

type ProjectFilter = "all" | ProjectStatus;

interface ProjectsFilterGridProps {
  dict: Dictionary;
  locale: Locale;
  projects: ProjectItem[];
}

export function ProjectsFilterGrid({ dict, locale, projects }: ProjectsFilterGridProps) {
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const filters: Array<{ key: ProjectFilter; label: string; count: number }> = [
    { key: "all", label: dict.projects.tabs.all, count: projects.length },
    ...projectStatusOrder.map((status) => ({
      key: status,
      label: dict.status[status],
      count: projects.filter((project) => project.status === status).length,
    })),
  ];

  const filteredProjects = useMemo(() => {
    if (filter === "all") {
      return projects;
    }
    return projects.filter((project) => project.status === filter);
  }, [filter, projects]);

  return (
    <section className="mt-4">
      <div className="glass-panel rounded-[30px] px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              }
            }}
            className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-2 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--text-muted)]"
          >
            ← {locale === "zh" ? "返回" : "Back"}
          </button>
          {filters.map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className="rounded-full px-4 py-2 text-sm font-medium transition"
                style={{
                  border: active ? "1px solid var(--text-main)" : "1px solid var(--line-muted)",
                  background: active ? "var(--text-main)" : "var(--button-bg)",
                  color: active ? "var(--page-bg)" : "var(--text-muted)",
                  boxShadow: active ? "0 8px 20px rgba(20,24,35,0.12)" : "none",
                }}
              >
                {item.label}
                <span style={{ marginLeft: 6, opacity: active ? 0.7 : 0.58 }}>{item.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={locale} dict={dict} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="glass-card mt-4 rounded-2xl px-4 py-8 text-sm text-[var(--text-muted)]">
          {locale === "zh" ? "暂无项目" : "No projects yet"}
        </div>
      )}
    </section>
  );
}
