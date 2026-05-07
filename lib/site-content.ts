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

let cachedContent: SiteContent | null = null;
let lastStoredString: string | null = null;

export function getContent(): SiteContent {
  if (typeof window === "undefined") {
    return defaultContent;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    // 返回缓存的内容，避免无限循环
    if (stored === lastStoredString && cachedContent) {
      return cachedContent;
    }

    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SiteContent>;
      cachedContent = {
        hero: { ...defaultContent.hero, ...parsed.hero },
        about: { ...defaultContent.about, ...parsed.about },
        brand: { ...defaultContent.brand, ...parsed.brand },
        footer: { ...defaultContent.footer, ...parsed.footer },
      };
    } else {
      cachedContent = defaultContent;
    }

    lastStoredString = stored;
    return cachedContent;
  } catch {
    // ignore
  }

  return defaultContent;
}

export function invalidateContentCache(): void {
  cachedContent = null;
  lastStoredString = null;
}

export function setContent(content: SiteContent): void {
  if (typeof window === "undefined") {
    return;
  }

  // 清除缓存
  cachedContent = null;
  lastStoredString = null;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
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
