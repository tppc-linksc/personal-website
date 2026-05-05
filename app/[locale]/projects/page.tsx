import { notFound } from "next/navigation";
import { ProjectsFilterGrid } from "@/components/ProjectsFilterGrid";
import { SiteHeader } from "@/components/SiteHeader";
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
        <SiteHeader
          locale={typedLocale}
          brand="tppc_linksc(和小冋)"
          center={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) { window.history.back(); } }}
                className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
              >
                ← {typedLocale === "zh" ? "返回" : "Back"}
              </button>
              <span className="text-sm font-semibold text-[var(--text-main)] md:text-base">{dict.projects.heading}</span>
            </div>
          }
        />

        <ProjectsFilterGrid dict={dict} locale={typedLocale} projects={projects} />
      </div>
    </main>
  );
}
