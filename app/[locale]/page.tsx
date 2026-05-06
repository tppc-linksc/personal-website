import { notFound } from "next/navigation";
import { LocalePageContent } from "@/components/LocalePageContent";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { selectFeaturedProjects, sortProjects } from "@/lib/project-selection";
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

        <LocalePageContent
          locale={typedLocale}
          dict={dict}
          projects={sortedProjects}
          featuredProjects={featuredProjects}
          showMore={showMore}
        />
      </div>
    </main>
  );
}
