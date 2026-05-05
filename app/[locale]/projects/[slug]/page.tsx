import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { MessageBoard } from "@/components/MessageBoard";
import { ProjectDetailActions } from "@/components/ProjectDetailActions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { t } from "@/lib/projects";
import { getProjectBySlug } from "@/lib/projects-source";

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
        <header className="glass-panel sticky top-3 z-30 rounded-[30px] px-4 py-3 md:px-8">
          <div
            className="page-topbar items-center gap-3"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)",
            }}
          >
            <Link href={`/${typedLocale}`} className="topbar-brand text-lg font-semibold text-[var(--text-main)]">
              tppc_linksc(和小冋)
            </Link>
            <div className="topbar-title flex min-w-0 items-center justify-center gap-2">
              <span className="truncate text-sm font-semibold text-[var(--text-main)] md:text-base">
                {t(project.title, typedLocale)}
              </span>
              <span className="project-pill shrink-0">{dict.status[project.status]}</span>
            </div>
            <div className="topbar-actions flex items-center justify-end gap-2">
              <LanguageSwitch locale={typedLocale} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <article className="glass-panel mt-4 overflow-hidden rounded-[30px] px-5 py-6 md:px-8 md:py-8">
          <div>
            <p className="text-lg text-[var(--text-muted)]">{t(project.tagline, typedLocale)}</p>

            <section className="mt-6">
              <h2 className="text-sm text-[var(--text-muted)]">{dict.detail.preview}</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)]">
                <Image
                  src={project.cover}
                  alt={t(project.title, typedLocale)}
                  width={1200}
                  height={720}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </section>

            <p className="mt-6 text-[15px] leading-8 text-[var(--text-muted)]">{t(project.description, typedLocale)}</p>

            <section className="mt-8">
              <h2 className="text-sm text-[var(--text-muted)]">{dict.detail.design}</h2>
              <p className="glass-card mt-3 rounded-2xl p-4 text-sm leading-7 text-[var(--text-muted)]">
                {t(project.design, typedLocale)}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-sm text-[var(--text-muted)]">{dict.detail.architecture}</h2>
              <p className="glass-card mt-3 rounded-2xl p-4 text-sm leading-7 text-[var(--text-muted)]">
                {t(project.architecture, typedLocale)}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-sm text-[var(--text-muted)]">{dict.detail.stack}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <span key={item} className="project-tech">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm text-[var(--text-muted)]">{dict.detail.links}</h2>
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
                  <span className="text-sm text-[var(--text-muted)]">{dict.detail.noLive}</span>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm text-[var(--text-muted)]">{dict.detail.video}</h2>
              <div className="mt-3">
                {project.videoUrl ? (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-1.5 text-sm text-[var(--text-main)] transition hover:border-[var(--text-muted)]"
                  >
                    Video Link
                  </a>
                ) : (
                  <span className="text-sm text-[var(--text-muted)]">{dict.detail.noVideo}</span>
                )}
              </div>
            </section>

            <MessageBoard slug={project.slug} locale={typedLocale} dict={dict.messages} />
          </div>
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
