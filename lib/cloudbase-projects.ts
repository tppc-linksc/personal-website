import {
  cloneLocalProjects,
  type LocalizedText,
  type ProjectItem,
  type ProjectStatus,
  type ProjectVisibility,
} from "@/lib/projects";
import { isCloudbaseConfigured, getCloudbaseApp, getCloudbaseDb, isCollectionMissingError } from "@/lib/cloudbase";

const COLLECTION = process.env.CLOUDBASE_PROJECTS_COLLECTION ?? "portfolio_projects";
const COVER_DIR = process.env.CLOUDBASE_COVER_DIR ?? "portfolio-covers";

function toText(value: unknown): LocalizedText {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.zh === "string" && typeof record.en === "string") {
      return { zh: record.zh, en: record.en };
    }
  }
  const fallback = typeof value === "string" ? value : "";
  return { zh: fallback, en: fallback };
}

function toStatus(value: unknown): ProjectStatus {
  if (value === "live" || value === "completed" || value === "in_progress" || value === "planned") {
    return value;
  }
  if (value === "next_up") {
    return "planned";
  }
  return "planned";
}

function toVisibility(value: unknown): ProjectVisibility {
  if (value === "draft" || value === "published") {
    return value;
  }
  return "published";
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function toProgress(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeCover(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "/projects/vibe-workspace.svg";
  }
  return value;
}

function normalizeProject(value: unknown): ProjectItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = typeof record.slug === "string" ? record.slug.trim() : "";
  const github = typeof record.github === "string" ? record.github.trim() : "";

  if (!slug || !github) {
    return null;
  }

  return {
    slug,
    status: toStatus(record.status),
    visibility: toVisibility(record.visibility),
    defaultFeatured: record.defaultFeatured === true,
    stars: typeof record.stars === "number" ? record.stars : undefined,
    githubCreatedAt: typeof record.githubCreatedAt === "string" ? record.githubCreatedAt : undefined,
    title: toText(record.title),
    tagline: toText(record.tagline),
    summary: toText(record.summary),
    description: toText(record.description),
    design: toText(record.design),
    architecture: toText(record.architecture),
    cover: normalizeCover(record.cover),
    eta: typeof record.eta === "string" ? record.eta : undefined,
    progress: toProgress(record.progress),
    tech: toStringList(record.tech),
    github,
    live: typeof record.live === "string" ? record.live : undefined,
    videoUrl: typeof record.videoUrl === "string" ? record.videoUrl : undefined,
    updatedAt: typeof record.updatedAt === "number" ? record.updatedAt : undefined,
    publishedAt: typeof record.publishedAt === "number" ? record.publishedAt : undefined,
  };
}



async function resolveCoverTempUrls(projects: ProjectItem[]): Promise<ProjectItem[]> {
  const cloudCovers = projects.filter((item) => item.cover.startsWith("cloud://"));
  if (cloudCovers.length === 0) {
    return projects;
  }

  const app = getCloudbaseApp();
  const fileList = cloudCovers.map((item) => item.cover.replace(/^cloud:\/\//, "")).filter(Boolean);
  const fileUrlRes = await app.getTempFileURL({ fileList });
  const urlMap = new Map<string, string>();

  for (const fileInfo of fileUrlRes.fileList ?? []) {
    if (fileInfo.fileID && fileInfo.tempFileURL) {
      urlMap.set(fileInfo.fileID, fileInfo.tempFileURL);
    }
  }

  return projects.map((item) => {
    if (!item.cover.startsWith("cloud://")) {
      return item;
    }
    const fileID = item.cover.replace(/^cloud:\/\//, "");
    const tempUrl = urlMap.get(fileID);
    if (!tempUrl) {
      return item;
    }
    return { ...item, cover: tempUrl };
  });
}

export async function listProjectsFromCloudbase(): Promise<ProjectItem[] | null> {
  if (!isCloudbaseConfigured()) {
    return null;
  }

  try {
    const db = getCloudbaseDb();
    const result = await db.collection(COLLECTION).limit(1000).get();
    const normalized = result.data.map(normalizeProject).filter((item): item is ProjectItem => item !== null);
    normalized.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    return resolveCoverTempUrls(normalized);
  } catch (error) {
    if (isCollectionMissingError(error)) {
      return [];
    }
    throw error;
  }
}

export async function getProjectFromCloudbase(slug: string): Promise<ProjectItem | null> {
  if (!isCloudbaseConfigured()) {
    return null;
  }

  try {
    const db = getCloudbaseDb();
    const result = await db.collection(COLLECTION).doc(slug).get();
    if (!result.data || result.data.length === 0) {
      return null;
    }
    const project = normalizeProject(result.data[0]);
    if (!project) {
      return null;
    }
    const [resolved] = await resolveCoverTempUrls([project]);
    return resolved;
  } catch (error) {
    if (isCollectionMissingError(error)) {
      return null;
    }
    throw error;
  }
}

export async function upsertProjectToCloudbase(project: ProjectItem): Promise<void> {
  const db = getCloudbaseDb();
  const now = Date.now();
  const safe = normalizeProject({ ...project, updatedAt: now });
  if (!safe) {
    throw new Error("Invalid project payload");
  }

  if (safe.visibility === "published" && !safe.publishedAt) {
    safe.publishedAt = now;
  }
  if (safe.visibility === "draft") {
    safe.publishedAt = undefined;
  }

  await db.collection(COLLECTION).doc(safe.slug).set(safe);
}

export async function removeProjectFromCloudbase(slug: string): Promise<void> {
  const db = getCloudbaseDb();
  await db.collection(COLLECTION).doc(slug).remove();
}

export async function seedCloudbaseWithLocalProjects(): Promise<void> {
  const db = getCloudbaseDb();
  const seeds = cloneLocalProjects();

  for (const project of seeds) {
    const now = Date.now();
    const seed = { ...project, visibility: project.visibility ?? "published", updatedAt: now, publishedAt: now };
    await db.collection(COLLECTION).doc(seed.slug).set(seed);
  }
}

export async function uploadCoverToCloudbase(params: {
  fileName: string;
  fileContent: Buffer;
}): Promise<{ fileID: string; tempUrl: string; cover: string }> {
  const app = getCloudbaseApp();
  const safeFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const cloudPath = `${COVER_DIR}/${Date.now()}-${safeFileName}`;
  const uploadRes = await app.uploadFile({
    cloudPath,
    fileContent: params.fileContent,
  });

  const fileID = uploadRes.fileID;
  const urlRes = await app.getTempFileURL({ fileList: [fileID] });
  const tempUrl = urlRes.fileList?.[0]?.tempFileURL ?? "";

  return {
    fileID,
    tempUrl,
    cover: `cloud://${fileID}`,
  };
}

export function usingCloudbase(): boolean {
  return isCloudbaseConfigured();
}
