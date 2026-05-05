import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ProjectsFilterGrid } from "@/components/ProjectsFilterGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { sortProjects } from "@/lib/project-selection";
import { getAllProjects } from "@/lib/projects-source";

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const dict = getDictionary(locale);
  return {
    title: `${dict.projects.heading} | ${dict.meta.title}`,
    description: dict.meta.description,
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const projects = sortProjects(await getAllProjects());

  return (
    <main className={`min-h-screen px-3 py-4 text-[var(--text-main)] md:px-6 ${typedLocale === "zh" ? "locale-zh" : "locale-en"}`}>
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel sticky top-3 z-30 rounded-[30px] px-4 py-3 md:px-8">
          <div
            className="page-topbar items-center gap-3"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
            }}
          >
            <Link href={`/${typedLocale}`} className="topbar-brand text-lg font-semibold text-[var(--text-main)]">
              tppc_linksc(和小冋)
            </Link>
            <div className="topbar-title text-sm font-semibold text-[var(--text-main)] md:text-base">{dict.projects.heading}</div>
            <div className="topbar-actions flex items-center justify-end gap-2">
              <LanguageSwitch locale={typedLocale} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <ProjectsFilterGrid dict={dict} locale={typedLocale} projects={projects} />
      </div>
    </main>
  );
}
