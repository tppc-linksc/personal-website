export interface SiteContent {
  hero: {
    greeting: { zh: string; en: string };
    title: { zh: string; en: string };
    summary: { zh: string; en: string };
    ctaPrimary: { zh: string; en: string };
    ctaPrimaryUrl: string;
    ctaSecondary: { zh: string; en: string };
    ctaSecondaryUrl: string;
  };
  about: {
    title: { zh: string; en: string };
    description: { zh: string; en: string };
    skills: string[];
    avatar: string;
  };
  brand: {
    name: string;
  };
  footer: {
    github: string;
    email: string;
  };
}

export const defaultContent: SiteContent = {
  hero: {
    greeting: { zh: "你好，我是", en: "Hi, I'm" },
    title: { zh: "AI驱动想法变成现实", en: "AI turns ideas into reality" },
    summary: {
      zh: "把 AI 编程、产品思维和工程落地融合成一条高速工作流。我的目标是：更快构建、更快验证、更快发布。",
      en: "I merge AI coding, product thinking, and engineering execution into one fast loop: build faster, validate faster, ship faster.",
    },
    ctaPrimary: { zh: "查看项目", en: "View Projects" },
    ctaPrimaryUrl: "#projects",
    ctaSecondary: { zh: "GitHub", en: "GitHub" },
    ctaSecondaryUrl: "https://github.com/tppc_linksc",
  },
  about: {
    title: { zh: "关于我", en: "About Me" },
    description: {
      zh: "我是一名前端开发者，热衷用 AI 把想法快速做成产品。",
      en: "I am a frontend developer turning ideas into products with AI.",
    },
    skills: ["AI Coding", "Frontend", "Product", "Deploy"],
    avatar: "/avatar-placeholder.svg",
  },
  brand: {
    name: "tppc_linksc(和小冋)",
  },
  footer: {
    github: "https://github.com/tppc_linksc",
    email: "mailto:hello@hexiaokou.com",
  },
};

const STORAGE_KEY = "site-content";
const STORAGE_VERSION = 1;

interface StoragePayload {
  __version: number;
  data: SiteContent;
}

let cachedSnapshot: SiteContent | null = null;
let lastRawString: string | null = null;

function migrateStorageData(raw: Partial<SiteContent> | Partial<StoragePayload>): Partial<SiteContent> {
  const hasVersion = raw && typeof raw === "object" && "__version" in raw;
  const version = hasVersion ? (raw as StoragePayload).__version : 0;
  const data = hasVersion ? (raw as StoragePayload).data : (raw as Partial<SiteContent>);

  if (version < STORAGE_VERSION) {
    // 未来版本变更时在这里添加迁移逻辑
  }

  return data ?? {};
}

function parseContent(raw: string | null): SiteContent {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<SiteContent> | Partial<StoragePayload>;
      const data = migrateStorageData(parsed);
      return {
        hero: { ...defaultContent.hero, ...data.hero },
        about: { ...defaultContent.about, ...data.about },
        brand: { ...defaultContent.brand, ...data.brand },
        footer: { ...defaultContent.footer, ...data.footer },
      };
    } catch {
      // ignore
    }
  }
  return { ...defaultContent };
}

export function getContent(): SiteContent {
  if (typeof window === "undefined") {
    return defaultContent;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === lastRawString && cachedSnapshot) {
    return cachedSnapshot;
  }

  cachedSnapshot = parseContent(raw);
  lastRawString = raw;
  return cachedSnapshot;
}

export function setContent(content: SiteContent): void {
  if (typeof window === "undefined") {
    return;
  }

  cachedSnapshot = null;
  lastRawString = null;

  const payload: StoragePayload = {
    __version: STORAGE_VERSION,
    data: content,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event("site-content-change"));
}

export function subscribeContent(callback: () => void): () => void {
  window.addEventListener("site-content-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("site-content-change", callback);
    window.removeEventListener("storage", callback);
  };
}
