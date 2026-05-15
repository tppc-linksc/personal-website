import type { ProjectItem, ProjectStatus } from "@/lib/projects";

export const projectStatusOrder: ProjectStatus[] = ["live", "completed", "in_progress", "planned"];

export function projectYear(project: ProjectItem): string {
  if (project.eta) {
    const match = project.eta.match(/(20\d{2})/);
    if (match) {
      return match[1];
    }
  }
  if (project.publishedAt) {
    return String(new Date(project.publishedAt).getFullYear());
  }
  if (project.updatedAt) {
    return String(new Date(project.updatedAt).getFullYear());
  }
  return "TBD";
}

export function projectRouteDate(project: ProjectItem): string {
  const raw = project.startDate ?? project.githubCreatedAt ?? (project.publishedAt ? new Date(project.publishedAt).toISOString() : undefined);
  if (raw) {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(raw));
  }
  if (project.updatedAt) {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(project.updatedAt));
  }
  return "TBD";
}

export function sortProjectsByStartDate(projects: ProjectItem[]): ProjectItem[] {
  return [...projects].sort((a, b) => {
    const dateA = a.startDate ?? "";
    const dateB = b.startDate ?? "";
    const cmp = dateB.localeCompare(dateA);
    if (cmp !== 0) return cmp;
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
  });
}

export function sortProjects(projects: ProjectItem[]): ProjectItem[] {
  return [...projects].sort((a, b) => {
    const statusDelta = projectStatusOrder.indexOf(a.status) - projectStatusOrder.indexOf(b.status);
    if (statusDelta !== 0) {
      return statusDelta;
    }
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
  });
}

function stableProjectDelta(a: ProjectItem, b: ProjectItem): number {
  const statusDelta = projectStatusOrder.indexOf(a.status) - projectStatusOrder.indexOf(b.status);
  if (statusDelta !== 0) {
    return statusDelta;
  }
  return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
}

export function selectFeaturedProjects(projects: ProjectItem[], count = 3): ProjectItem[] {
  const picked = new Map<string, ProjectItem>();

  const highStar = [...projects]
    .filter((project) => (project.stars ?? 0) > 0)
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || stableProjectDelta(a, b));

  for (const project of highStar) {
    if (picked.size >= count) {
      break;
    }
    picked.set(project.slug, project);
  }

  for (const project of projects.filter((item) => item.defaultFeatured)) {
    if (picked.size >= count) {
      break;
    }
    picked.set(project.slug, project);
  }

  for (const project of sortProjects(projects)) {
    if (picked.size >= count) {
      break;
    }
    picked.set(project.slug, project);
  }

  return Array.from(picked.values()).slice(0, count);
}
