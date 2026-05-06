import { cloneLocalProjects, type ProjectItem } from "@/lib/projects";

function isVisible(project: ProjectItem): boolean {
  return (project.visibility ?? "published") === "published";
}

export function getAllProjects(options?: { includeDraft?: boolean }): ProjectItem[] {
  const includeDraft = Boolean(options?.includeDraft);
  const local = cloneLocalProjects();
  return includeDraft ? local : local.filter(isVisible);
}

export function getProjectBySlug(slug: string, options?: { includeDraft?: boolean }): ProjectItem | undefined {
  const includeDraft = Boolean(options?.includeDraft);
  const local = cloneLocalProjects();
  const found = local.find((item) => item.slug === slug);
  if (!found) return undefined;
  if (!includeDraft && !isVisible(found)) return undefined;
  return found;
}
