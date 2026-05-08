"use client";

import Link from "next/link";
import Image from "next/image";
import { InteractiveHeroScene } from "@/components/InteractiveHeroScene";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitCounter } from "@/components/VisitCounter";
import type { SiteContent } from "@/lib/site-content-types";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { ProjectItem } from "@/lib/projects";
import { t } from "@/lib/projects";
import { projectRouteDate } from "@/lib/project-selection";

interface LocalePageContentProps {
  locale: Locale;
  dict: Dictionary;
  content: SiteContent;
  projects: ProjectItem[];
  featuredProjects: ProjectItem[];
  showMore: boolean;
}

export function LocalePageContent({
  locale,
  dict,
  content,
  projects,
  featuredProjects,
  showMore,
}: LocalePageContentProps) {

  return (
    <>
      <SiteHeader locale={locale} brand={content.brand.name} />

      <section className="glass-panel hero-fusion-panel relative mt-4 min-h-[520px] overflow-hidden rounded-[30px] px-5 py-6 md:min-h-[520px] md:px-8 md:py-8 xl:min-h-[560px]">
        <InteractiveHeroScene />
        <div className="relative z-10 max-w-[48rem] pt-2 md:max-w-[52%] md:pt-8 xl:max-w-[46%]">
            <p className="text-sm text-[var(--text-soft)]">
              {locale === "zh" ? content.hero.greeting.zh : content.hero.greeting.en}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.08] text-[var(--text-main)] md:text-6xl" style={{ whiteSpace: "pre-line" }}>
              {locale === "zh" ? content.hero.title.zh : content.hero.title.en}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-muted)]" style={{ whiteSpace: "pre-line" }}>
              {locale === "zh" ? content.hero.summary.zh : content.hero.summary.en}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={content.hero.ctaPrimaryUrl}
                className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                {locale === "zh" ? content.hero.ctaPrimary.zh : content.hero.ctaPrimary.en}
              </a>
              <a
                href={content.hero.ctaSecondaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                {locale === "zh" ? content.hero.ctaSecondary.zh : content.hero.ctaSecondary.en}
              </a>
            </div>
        </div>
      </section>

      <section id="projects" className="glass-panel mt-4 rounded-[30px] px-4 py-4 md:px-5 md:py-5">
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-sm font-medium text-[var(--text-muted)]">{locale === "zh" ? "精选项目" : "Featured Projects"}</p>
          {showMore && (
            <Link href={`/${locale}/projects`} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]">
              {locale === "zh" ? "查看更多" : "More"} →
            </Link>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} dict={dict} />
          ))}
        </div>
      </section>

      <section
        className="home-split-inline mt-4"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: "1rem",
          alignItems: "stretch",
        }}
      >
        <article id="route" className="glass-panel rounded-[24px] px-4 py-3 md:px-5 flex flex-col">
          <p className="text-sm font-medium text-[var(--text-muted)]">{locale === "zh" ? "项目路线" : "Project Roadmap"}</p>
          <div className="mt-2 flex-1 overflow-y-auto pr-1">
            {projects.map((project) => (
              <a
                key={project.slug}
                href={project.github || `/${locale}/projects/${project.slug}`}
                target={project.github ? "_blank" : undefined}
                rel={project.github ? "noopener noreferrer" : undefined}
                className="grid items-center gap-3 border-b border-[var(--line-muted)] py-2 text-sm transition hover:text-[var(--text-main)]"
                style={{
                  gridTemplateColumns: "18px 96px minmax(92px, 0.55fr) minmax(0, 1fr)",
                }}
              >
                <span className="relative h-full min-h-8">
                  <span
                    className="absolute left-1/2 top-[-8px] h-[calc(100%+16px)] w-px -translate-x-1/2"
                    style={{ background: "var(--line-muted)" }}
                  />
                  <span
                    className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-[var(--page-bg)]"
                    style={{ borderColor: "var(--text-soft)" }}
                  />
                </span>
                <span className="truncate text-xs text-[var(--text-soft)]">{projectRouteDate(project)}</span>
                <span className="truncate font-medium text-[var(--text-main)]">{t(project.title, locale)}</span>
                <span className="truncate text-xs text-[var(--text-muted)]">{t(project.summary, locale)}</span>
              </a>
            ))}
          </div>
        </article>

        <article id="about" className="glass-panel rounded-[24px] px-4 py-3 md:px-5">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(132px, 34%)",
              alignItems: "stretch",
              gap: "1rem",
              minHeight: 210,
            }}
          >
            <div style={{ alignSelf: "start" }}>
              <p className="text-sm font-medium text-[var(--text-muted)]">
                {locale === "zh" ? content.about.title.zh : content.about.title.en}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {locale === "zh" ? content.about.description.zh : content.about.description.en}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.about.skills.map((item) => (
                  <span key={item} className="project-tech">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)]"
              style={{
                alignSelf: "stretch",
                justifySelf: "stretch",
                minHeight: 190,
              }}
            >
              {content.about.avatar.startsWith("data:") ? (
                <img
                  src={content.about.avatar}
                  alt={locale === "zh" ? "头像" : "Portrait"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={content.about.avatar}
                  alt={locale === "zh" ? "头像" : "Portrait"}
                  width={640}
                  height={760}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </article>
      </section>

      <footer
        id="contact"
        className="glass-panel mt-4 flex items-center justify-between rounded-[24px] px-5 py-4 text-sm text-[var(--text-muted)]"
      >
        <div>© {new Date().getFullYear()} {dict.hero.name}</div>
        <div>
          <VisitCounter locale={locale} variant="inline" />
        </div>
      </footer>
    </>
  );
}
