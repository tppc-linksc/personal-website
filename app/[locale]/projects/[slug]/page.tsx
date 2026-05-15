import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageBoard } from "@/components/MessageBoard";
import { ProjectDetailActions } from "@/components/ProjectDetailActions";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { t } from "@/lib/projects";
import { getProjectBySlug } from "@/lib/projects-source";
import { techColor } from "@/lib/tech-colors";

interface ProjectDetailProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const project = await getProjectBySlug(slug);
  if (!project) {
    return {};
  }

  return {
    title: `${t(project.title, locale)} | ${getDictionary(locale).meta.title}`,
    description: t(project.summary, locale),
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className={`min-h-screen px-3 py-4 text-[var(--text-main)] md:px-6 ${typedLocale === "zh" ? "locale-zh" : "locale-en"}`}>
      <div className="mx-auto max-w-5xl">
        <SiteHeader
          locale={typedLocale}
          brand="tppc_linksc(和小冋)"
          center={
            <div className="flex min-w-0 items-center justify-center gap-2">
              <span className="truncate text-sm font-semibold text-[var(--text-main)] md:text-base">
                {t(project.title, typedLocale)}
              </span>
              <span className="project-pill shrink-0">{dict.status[project.status]}</span>
            </div>
          }
        />

        <article className="glass-panel mt-4 overflow-hidden rounded-[30px] px-5 py-6 md:px-8 md:py-8">
          <p className="text-lg text-[var(--text-muted)]">{t(project.tagline, typedLocale)}</p>

          <div className="detail-section">
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)]">
              <Image
                src={project.cover}
                alt={t(project.title, typedLocale)}
                width={1200}
                height={720}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>

          <p className="detail-section text-[15px] leading-8 text-[var(--text-muted)]">{t(project.description, typedLocale)}</p>

          <div className="detail-section detail-info-grid">
            <div className="flex flex-col">
              <h2 className="detail-section-label">{dict.detail.design}</h2>
              <p className="glass-card mt-3 flex-1 rounded-2xl p-4 text-sm leading-7 text-[var(--text-muted)]">
                {t(project.design, typedLocale)}
              </p>
            </div>
            <div className="flex flex-col">
              <h2 className="detail-section-label">{dict.detail.architecture}</h2>
              <p className="glass-card mt-3 flex-1 rounded-2xl p-4 text-sm leading-7 text-[var(--text-muted)]">
                {t(project.architecture, typedLocale)}
              </p>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="detail-section-label">{dict.detail.stack}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tech.map((item) => (
                <span key={item} className="project-tech-badge" style={{ backgroundColor: techColor(item) }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h2 className="detail-section-label">{dict.detail.links}</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-1.5 text-sm text-[var(--text-main)] transition hover:border-[var(--text-muted)]"
              >
                GitHub
              </a>
              {project.live ? (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-1.5 text-sm text-[var(--text-main)] transition hover:border-[var(--text-muted)]"
                >
                  Live
                </a>
              ) : (
                <span className="rounded-full border border-[var(--line-muted)] bg-[var(--panel-soft)] px-4 py-1.5 text-sm text-[var(--text-soft)] opacity-60">{dict.detail.noLive}</span>
              )}
              {project.videoUrl ? (
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-1.5 text-sm text-[var(--text-main)] transition hover:border-[var(--text-muted)]"
                >
                  Video
                </a>
              ) : null}
            </div>
          </div>

          <MessageBoard slug={project.slug} locale={typedLocale} dict={dict.messages} />
        </article>
      </div>
      <ProjectDetailActions
        homeHref={`/${typedLocale}`}
        fallbackHref={`/${typedLocale}/projects`}
        labels={{
          home: typedLocale === "zh" ? "首页" : "Home",
          back: typedLocale === "zh" ? "返回" : "Back",
          top: typedLocale === "zh" ? "顶部" : "Top",
        }}
      />
    </main>
  );
}
