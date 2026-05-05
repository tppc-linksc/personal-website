import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { projectYear } from "@/lib/project-selection";
import { t, type ProjectItem } from "@/lib/projects";

interface ProjectCardProps {
  project: ProjectItem;
  locale: Locale;
  dict: Dictionary;
}

export function ProjectCard({ project, locale, dict }: ProjectCardProps) {
  return (
    <article className="project-card group">
      <Link href={`/${locale}/projects/${project.slug}`} className="block h-full">
        <div className="project-card-media">
          <Image
            src={project.cover}
            alt={t(project.title, locale)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        </div>

        <div className="project-card-body">
          <div className="project-card-meta">
            <span className="project-pill">{dict.status[project.status]}</span>
            <span>{projectYear(project)}</span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <h3 className="project-card-title">{t(project.title, locale)}</h3>
            {(project.stars ?? 0) > 0 && <span className="project-stars">{project.stars}</span>}
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t(project.tagline, locale)}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((tech) => (
              <span key={tech} className="project-tech">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
