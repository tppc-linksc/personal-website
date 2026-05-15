import { getAllProjects as getFromStore, getProjectBySlug as getFromStoreBySlug } from "@/lib/projects-store";
import type { ProjectItem } from "@/lib/projects";

function isVisible(project: ProjectItem): boolean {
  return (project.visibility ?? "published") === "published";
}

export function getAllProjects(options?: { includeDraft?: boolean }): ProjectItem[] {
  const includeDraft = Boolean(options?.includeDraft);
  const projects = getFromStore();
  return includeDraft ? projects : projects.filter(isVisible);
}

export function getProjectBySlug(slug: string, options?: { includeDraft?: boolean }): ProjectItem | undefined {
  const includeDraft = Boolean(options?.includeDraft);
  const project = getFromStoreBySlug(slug);
  if (!project) return undefined;
  if (!includeDraft && !isVisible(project)) return undefined;
  return project;
}
