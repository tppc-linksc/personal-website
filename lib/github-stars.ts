import type { ProjectItem } from "@/lib/projects";

const CACHE_TTL_MS = Number(process.env.GITHUB_STARS_CACHE_TTL_MS ?? 30 * 60 * 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.GITHUB_STARS_TIMEOUT_MS ?? 2500);

interface StarCacheEntry {
  expiresAt: number;
  stars: number;
  createdAt?: string;
}

const starCache = new Map<string, StarCacheEntry>();

function parseGithubRepo(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
      return null;
    }
    const [owner, repo] = parsed.pathname.replace(/^\/+/, "").split("/");
    if (!owner || !repo) {
      return null;
    }
    return `${owner}/${repo.replace(/\.git$/, "")}`;
  } catch {
    return null;
  }
}

async function fetchRepoMeta(repo: string): Promise<{ stars: number; createdAt?: string }> {
  const hit = starCache.get(repo);
  if (hit && hit.expiresAt > Date.now()) {
    return { stars: hit.stars, createdAt: hit.createdAt };
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hexiaojiong-portfolio",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: Math.floor(CACHE_TTL_MS / 1000) },
    });
    if (!res.ok) {
      throw new Error(`GitHub responded ${res.status}`);
    }
    const json = (await res.json()) as { stargazers_count?: unknown; created_at?: unknown };
    const stars = typeof json.stargazers_count === "number" ? json.stargazers_count : 0;
    const createdAt = typeof json.created_at === "string" ? json.created_at : undefined;
    starCache.set(repo, { expiresAt: Date.now() + CACHE_TTL_MS, stars, createdAt });
    return { stars, createdAt };
  } catch {
    starCache.set(repo, { expiresAt: Date.now() + Math.min(CACHE_TTL_MS, 5 * 60 * 1000), stars: 0 });
    return { stars: 0 };
  }
}

export async function resolveGithubStarsForProjects(projects: ProjectItem[]): Promise<ProjectItem[]> {
  const repoBySlug = new Map<string, string>();
  for (const project of projects) {
    const repo = parseGithubRepo(project.github);
    if (repo) {
      repoBySlug.set(project.slug, repo);
    }
  }

  if (repoBySlug.size === 0) {
    return projects.map((project) => ({ ...project, stars: project.stars ?? 0 }));
  }

  const metaEntries = await Promise.all(
    Array.from(repoBySlug.entries()).map(async ([slug, repo]) => [slug, await fetchRepoMeta(repo)] as const)
  );
  const metaBySlug = new Map(metaEntries);

  return projects.map((project) => ({
    ...project,
    stars: metaBySlug.get(project.slug)?.stars ?? project.stars ?? 0,
    githubCreatedAt: metaBySlug.get(project.slug)?.createdAt ?? project.githubCreatedAt,
  }));
}
