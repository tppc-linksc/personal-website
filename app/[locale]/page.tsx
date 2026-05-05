import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { InteractiveHeroScene } from "@/components/InteractiveHeroScene";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitCounter } from "@/components/VisitCounter";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { projectRouteDate, selectFeaturedProjects, sortProjects } from "@/lib/project-selection";
import { t } from "@/lib/projects";
import { getAllProjects } from "@/lib/projects-source";

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const projects = await getAllProjects();
  const sortedProjects = sortProjects(projects);
  const featuredProjects = selectFeaturedProjects(sortedProjects, 3);
  const showMore = projects.length > 3;

  return (
    <main className={`min-h-screen px-3 py-4 text-[var(--text-main)] md:px-6 ${typedLocale === "zh" ? "locale-zh" : "locale-en"}`}>
      <div className="mx-auto max-w-7xl">
        <SiteHeader
          locale={typedLocale}
          brand="tppc_linksc(和小冋)"
        />

        <section className="glass-panel hero-fusion-panel relative mt-4 min-h-[520px] overflow-hidden rounded-[30px] px-5 py-6 md:min-h-[520px] md:px-8 md:py-8 xl:min-h-[560px]">
          <InteractiveHeroScene />
          <div className="relative z-10 max-w-[48rem] pt-2 md:max-w-[52%] md:pt-8 xl:max-w-[46%]">
              <p className="text-sm text-[var(--text-soft)]">{typedLocale === "zh" ? `你好，我是${dict.hero.name}` : `Hi, I'm ${dict.hero.name}`}</p>
              <h1 className="mt-3 text-4xl font-semibold leading-[1.08] text-[var(--text-main)] md:text-6xl">
                {typedLocale === "zh" ? "AI驱动想法变成现实" : "AI turns ideas into reality"}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-muted)]">{dict.hero.summary}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="rounded-full bg-[var(--text-main)] px-6 py-2.5 text-sm font-medium text-[var(--page-bg)] transition hover:opacity-90"
                >
                  {dict.hero.ctaPrimary}
                </a>
                <a
                  href="https://github.com/tppc_linksc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  {dict.hero.ctaSecondary}
                </a>
              </div>
          </div>
        </section>

        <section id="projects" className="glass-panel mt-4 rounded-[30px] px-4 py-4 md:px-5 md:py-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <p className="text-sm font-medium text-[var(--text-muted)]">{typedLocale === "zh" ? "精选项目" : "Featured Projects"}</p>
            {showMore && (
              <Link href={`/${typedLocale}/projects`} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]">
                {typedLocale === "zh" ? "查看更多" : "More"} →
              </Link>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} locale={typedLocale} dict={dict} />
            ))}
          </div>
        </section>

        <section
          className="home-split-inline mt-4"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            gap: "1rem",
          }}
        >
          <article id="route" className="glass-panel rounded-[24px] px-4 py-3 md:px-5">
            <p className="text-sm font-medium text-[var(--text-muted)]">{typedLocale === "zh" ? "项目路线" : "Project Roadmap"}</p>
            <div className="mt-2 h-[210px] overflow-y-auto pr-1">
              {sortedProjects.map((project) => (
                <a
                  key={project.slug}
                  href={project.github || `/${typedLocale}/projects/${project.slug}`}
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
                  <span className="truncate font-medium text-[var(--text-main)]">{t(project.title, typedLocale)}</span>
                  <span className="truncate text-xs text-[var(--text-muted)]">{t(project.summary, typedLocale)}</span>
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
              <div style={{ alignSelf: "center" }}>
                <p className="text-sm font-medium text-[var(--text-muted)]">{typedLocale === "zh" ? "关于我" : "About Me"}</p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-[var(--text-main)] md:text-xl">
                  {typedLocale === "zh"
                    ? "我是一名前端开发者，热衷用 AI 把想法快速做成产品。"
                    : "I am a frontend developer turning ideas into products with AI."}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {typedLocale === "zh"
                    ? "这里先保留为占位内容：未来会补充我的经历、工作方式、擅长领域和合作方向。"
                    : "Placeholder copy for now: experience, workflow, focus areas, and collaboration notes will be refined later."}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["AI Coding", "Frontend", "Product", "Deploy"].map((item) => (
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
                <Image
                  src="/avatar-placeholder.svg"
                  alt={typedLocale === "zh" ? "头像占位图" : "Portrait placeholder"}
                  width={640}
                  height={760}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </article>
        </section>

        <footer
          id="contact"
          className="glass-panel mt-4 flex flex-col gap-2 rounded-[24px] px-5 py-4 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between"
        >
          <div>© {new Date().getFullYear()} {dict.hero.name}</div>
          <div>
            <VisitCounter locale={typedLocale} variant="inline" />
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/tppc_linksc" target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--text-main)]">
              GitHub
            </a>
            <a href="mailto:hello@hexiaokou.com" className="transition hover:text-[var(--text-main)]">
              Email
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
