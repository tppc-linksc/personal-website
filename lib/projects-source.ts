import { cloneLocalProjects, type ProjectItem } from "@/lib/projects";
import { resolveGithubStarsForProjects } from "@/lib/github-stars";
import {
  getProjectFromCloudbase,
  listProjectsFromCloudbase,
  removeProjectFromCloudbase,
  seedCloudbaseWithLocalProjects,
  upsertProjectToCloudbase,
  usingCloudbase,
} from "@/lib/cloudbase-projects";

function isVisible(project: ProjectItem): boolean {
  return (project.visibility ?? "published") === "published";
}

const CACHE_TTL_MS = Number(process.env.PROJECTS_CACHE_TTL_MS ?? 30000);

interface CacheEntry {
  expiresAt: number;
  items: ProjectItem[];
}

const cache = {
  published: null as CacheEntry | null,
  all: null as CacheEntry | null,
};

function cloneProjects(items: ProjectItem[]): ProjectItem[] {
  return items.map((item) => ({
    ...item,
    title: { ...item.title },
    tagline: { ...item.tagline },
    summary: { ...item.summary },
    description: { ...item.description },
    design: { ...item.design },
    architecture: { ...item.architecture },
    tech: [...item.tech],
  }));
}

function readCache(includeDraft: boolean): ProjectItem[] | null {
  const bucket = includeDraft ? cache.all : cache.published;
  if (!bucket) {
    return null;
  }
  if (bucket.expiresAt <= Date.now()) {
    return null;
  }
  return cloneProjects(bucket.items);
}

function writeCache(includeDraft: boolean, items: ProjectItem[]) {
  const entry: CacheEntry = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    items: cloneProjects(items),
  };
  if (includeDraft) {
    cache.all = entry;
  } else {
    cache.published = entry;
  }
}

export function invalidateProjectsCache() {
  cache.all = null;
  cache.published = null;
}

export async function getAllProjects(options?: { includeDraft?: boolean }): Promise<ProjectItem[]> {
  const includeDraft = Boolean(options?.includeDraft);
  const hit = readCache(includeDraft);
  if (hit) {
    return hit;
  }

  try {
    const cloud = await listProjectsFromCloudbase();
    if (cloud && cloud.length > 0) {
      const resolved = includeDraft ? cloud : cloud.filter(isVisible);
      const withStars = await resolveGithubStarsForProjects(resolved);
      writeCache(includeDraft, withStars);
      return cloneProjects(withStars);
    }
  } catch (error) {
    console.error("[projects-source] list cloudbase failed", error);
  }

  const local = cloneLocalProjects().map((item) => ({ ...item, visibility: item.visibility ?? "published" }));
  const fallback = includeDraft ? local : local.filter(isVisible);
  const withStars = await resolveGithubStarsForProjects(fallback);
  writeCache(includeDraft, withStars);
  return cloneProjects(withStars);
}

export async function getProjectBySlug(slug: string, options?: { includeDraft?: boolean }): Promise<ProjectItem | undefined> {
  const includeDraft = Boolean(options?.includeDraft);
  const fromList = await getAllProjects({ includeDraft });
  const direct = fromList.find((item) => item.slug === slug);
  if (direct) {
    return direct;
  }

  try {
    const cloud = await getProjectFromCloudbase(slug);
    if (cloud) {
      if (!includeDraft && !isVisible(cloud)) {
        return undefined;
      }
      return cloud;
    }
  } catch (error) {
    console.error("[projects-source] get cloudbase failed", error);
  }

  const local = cloneLocalProjects().map((item) => ({ ...item, visibility: item.visibility ?? "published" }));
  const found = local.find((item) => item.slug === slug);
  if (!found) {
    return undefined;
  }
  if (!includeDraft && !isVisible(found)) {
    return undefined;
  }
  return found;
}

export async function saveProject(project: ProjectItem): Promise<void> {
  await upsertProjectToCloudbase(project);
}

export async function deleteProject(slug: string): Promise<void> {
  await removeProjectFromCloudbase(slug);
}

export async function seedProjects(): Promise<void> {
  await seedCloudbaseWithLocalProjects();
}

export function isCloudbaseEnabled(): boolean {
  return usingCloudbase();
}
