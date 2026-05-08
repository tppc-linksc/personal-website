import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";
import type { SiteContent } from "@/lib/site-content-types";
import { defaultContent } from "@/lib/site-content-types";

const DATA_DIR = join(process.cwd(), "data");
const CONTENT_FILE = join(DATA_DIR, "site-content.json");
const STORAGE_VERSION = 1;

interface StoragePayload {
  __version: number;
  data: SiteContent;
}

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function createDefaultPayload(): StoragePayload {
  return { __version: STORAGE_VERSION, data: structuredClone(defaultContent) };
}

function readPayload(): StoragePayload {
  ensureDir();

  if (!existsSync(CONTENT_FILE)) {
    const payload = createDefaultPayload();
    writeFileSync(CONTENT_FILE, JSON.stringify(payload, null, 2), "utf-8");
    return payload;
  }

  try {
    const raw = readFileSync(CONTENT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoragePayload>;

    if (!parsed.data) {
      return createDefaultPayload();
    }

    return {
      __version: parsed.__version ?? 0,
      data: {
        hero: { ...defaultContent.hero, ...parsed.data.hero },
        about: { ...defaultContent.about, ...parsed.data.about },
        brand: { ...defaultContent.brand, ...parsed.data.brand },
        footer: { ...defaultContent.footer, ...parsed.data.footer },
      },
    };
  } catch {
    return createDefaultPayload();
  }
}

export function getContent(): SiteContent {
  return structuredClone(readPayload().data);
}

export function setContent(content: SiteContent): void {
  ensureDir();

  const payload: StoragePayload = {
    __version: STORAGE_VERSION,
    data: content,
  };

  const tmp = `${CONTENT_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(payload, null, 2), "utf-8");
  renameSync(tmp, CONTENT_FILE);
}
