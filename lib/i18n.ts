export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    about: string;
    projects: string;
    nextUp: string;
    contact: string;
  };
  hero: {
    badge: string;
    name: string;
    role: string;
    summary: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: Array<{ label: string; value: string }>;
  };
  about: {
    title: string;
    heading: string;
    body: string[];
    pillars: Array<{ title: string; items: string[] }>;
  };
  projects: {
    title: string;
    heading: string;
    designLabel: string;
    tabs: {
      all: string;
      live: string;
      completed: string;
      in_progress: string;
      planned: string;
      paused: string;
    };
    viewDetail: string;
    openGithub: string;
    openLive: string;
  };
  nextUp: {
    title: string;
    heading: string;
    eta: string;
    progressLabel: string;
    cta: string;
  };
  contact: {
    title: string;
    heading: string;
    body: string;
    email: string;
  };
  status: {
    live: string;
    completed: string;
    in_progress: string;
    planned: string;
    paused: string;
  };
  detail: {
    back: string;
    stack: string;
    design: string;
    architecture: string;
    preview: string;
    video: string;
    links: string;
    noLive: string;
    noVideo: string;
  };
  messages: {
    title: string;
    subtitle: string;
    nickname: string;
    nicknamePlaceholder: string;
    content: string;
    contentPlaceholder: string;
    submit: string;
    submitting: string;
    reply: string;
    cancelReply: string;
    ownerTag: string;
    empty: string;
    sortLabel: string;
    sortTime: string;
    sortHot: string;
    replyTo: string;
    replies: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    meta: {
      title: "和小冋 | Vibe Coding 项目集",
      description: "独立开发者作品站：已完成项目、进行中探索、下一步计划。",
    },
    nav: {
      about: "关于",
      projects: "项目",
      nextUp: "项目总览",
      contact: "联系",
    },
    hero: {
      badge: "可合作 · 接受新项目",
      name: "和小冋",
      role: "Vibe Coder & Indie Builder",
      summary:
        "把 AI 编程、产品思维和工程落地融合成一条高速工作流。我的目标是：更快构建、更快验证、更快发布。",
      ctaPrimary: "查看项目",
      ctaSecondary: "GitHub",
      stats: [
        { label: "已发布项目", value: "2+" },
        { label: "计划中项目", value: "4" },
        { label: "开发方式", value: "AI Native" },
      ],
    },
    about: {
      title: "01 / ABOUT",
      heading: "关于我",
      body: [
        "我是前端开发背景的独立开发者，专注把模糊想法变成可上线产品。",
        "我采用 Vibe Coding 的工作方式：需求建模、AI 协作编码、快速验证、持续迭代。",
        "关注方向是效率工具、AI 应用和开发者产品。",
      ],
      pillars: [
        { title: "工作流", items: ["Idea → Spec", "AI Co-build", "Ship Fast"] },
        { title: "技术栈", items: ["Next.js", "TypeScript", "R3F", "Node.js"] },
        { title: "偏好", items: ["极简设计", "快速交付", "可持续迭代"] },
      ],
    },
    projects: {
      title: "02 / PROJECTS",
      heading: "项目总览",
      designLabel: "项目设计",
      tabs: {
        all: "全部",
        live: "已上线",
        completed: "已完成",
        in_progress: "开发中",
        planned: "计划中",
        paused: "暂停开发",
      },
      viewDetail: "查看详情",
      openGithub: "源码",
      openLive: "在线体验",
    },
    nextUp: {
      title: "03 / NEXT UP",
      heading: "下一个项目预告",
      eta: "预计上线",
      progressLabel: "当前进度",
      cta: "查看项目路线",
    },
    contact: {
      title: "04 / CONTACT",
      heading: "一起做点有意思的事",
      body: "如果你也在做 AI 产品或工具，欢迎交流合作。",
      email: "邮件联系",
    },
    status: {
      live: "已上线",
      completed: "已完成",
      in_progress: "开发中",
      planned: "计划中",
      paused: "暂停开发",
    },
    detail: {
      back: "返回首页",
      stack: "技术栈",
      design: "项目设计",
      architecture: "项目架构",
      preview: "项目图示",
      video: "项目视频",
      links: "项目链接",
      noLive: "暂未开放在线版本",
      noVideo: "暂无视频链接",
    },
    messages: {
      title: "留言区",
      subtitle: "无需登录即可留言和回复。作者登录后回复会自动带“作者”标签。",
      nickname: "昵称",
      nicknamePlaceholder: "输入昵称（可留空）",
      content: "内容",
      contentPlaceholder: "写下你的想法、建议或问题…",
      submit: "发送",
      submitting: "发送中...",
      reply: "回复",
      cancelReply: "取消回复",
      ownerTag: "作者",
      empty: "还没有留言，来发第一条吧。",
      sortLabel: "排序方式",
      sortTime: "按时间",
      sortHot: "按热度",
      replyTo: "回复给",
      replies: "条回复",
    },
  },
  en: {
    meta: {
      title: "Hexiaojiong | Vibe Coding Portfolio",
      description: "Indie builder portfolio with shipped, in-progress, and planned projects.",
    },
    nav: {
      about: "About",
      projects: "Projects",
      nextUp: "Overview",
      contact: "Contact",
    },
    hero: {
      badge: "Open for collaboration",
      name: "Hexiaojiong",
      role: "Vibe Coder & Indie Builder",
      summary:
        "I merge AI coding, product thinking, and engineering execution into one fast loop: build faster, validate faster, ship faster.",
      ctaPrimary: "View Projects",
      ctaSecondary: "GitHub",
      stats: [
        { label: "Shipped Projects", value: "2+" },
        { label: "Planned Projects", value: "4" },
        { label: "Workflow", value: "AI Native" },
      ],
    },
    about: {
      title: "01 / ABOUT",
      heading: "Who I Am",
      body: [
        "I am an indie developer with a frontend background, focused on turning raw ideas into launchable products.",
        "My Vibe Coding workflow is: requirement framing, AI-assisted implementation, fast validation, and continuous iteration.",
        "I mainly build productivity tools, AI apps, and developer-focused products.",
      ],
      pillars: [
        { title: "Workflow", items: ["Idea → Spec", "AI Co-build", "Ship Fast"] },
        { title: "Stack", items: ["Next.js", "TypeScript", "R3F", "Node.js"] },
        { title: "Style", items: ["Minimal UI", "Fast delivery", "Sustainable iteration"] },
      ],
    },
    projects: {
      title: "02 / PROJECTS",
      heading: "Project Explorer",
      designLabel: "Project Design",
      tabs: {
        all: "All",
        live: "Live",
        completed: "Completed",
        in_progress: "In Progress",
        planned: "Planned",
        paused: "Paused",
      },
      viewDetail: "View Details",
      openGithub: "Source",
      openLive: "Live",
    },
    nextUp: {
      title: "03 / NEXT UP",
      heading: "What I Build Next",
      eta: "ETA",
      progressLabel: "Current Progress",
      cta: "See Roadmap",
    },
    contact: {
      title: "04 / CONTACT",
      heading: "Let’s Build Something Sharp",
      body: "If you are building AI products or tools, I’m open to collaborate.",
      email: "Email Me",
    },
    status: {
      live: "Live",
      completed: "Completed",
      in_progress: "In Progress",
      planned: "Planned",
      paused: "Paused",
    },
    detail: {
      back: "Back Home",
      stack: "Tech Stack",
      design: "Design",
      architecture: "Architecture",
      preview: "Preview",
      video: "Project Video",
      links: "Links",
      noLive: "No public live version yet",
      noVideo: "No video link yet",
    },
    messages: {
      title: "Messages",
      subtitle: "Anyone can leave a message or reply. Author replies are labeled automatically when logged in.",
      nickname: "Nickname",
      nicknamePlaceholder: "Your name (optional)",
      content: "Content",
      contentPlaceholder: "Share your feedback, idea, or question...",
      submit: "Post",
      submitting: "Posting...",
      reply: "Reply",
      cancelReply: "Cancel Reply",
      ownerTag: "AUTHOR",
      empty: "No messages yet. Be the first one.",
      sortLabel: "Sort",
      sortTime: "By Time",
      sortHot: "By Hot",
      replyTo: "Reply to",
      replies: "replies",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return structuredClone(dictionaries[locale]);
}
