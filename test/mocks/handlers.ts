import { http, HttpResponse } from "msw";
import type { SiteContent } from "@/lib/site-content-types";
import { defaultContent } from "@/lib/site-content-types";
import type { ProjectItem } from "@/lib/projects";
import type { MessageNode } from "@/lib/messages";

export const store = {
  siteContent: structuredClone(defaultContent) as SiteContent,
  projects: [] as ProjectItem[],
  messages: [] as MessageNode[],
  visits: 42 as number,
  sessionValid: false,
  studioAuthorized: false,
  uploadSuccess: true,
};

export function resetStore() {
  store.siteContent = structuredClone(defaultContent);
  store.projects = [];
  store.messages = [];
  store.visits = 42;
  store.sessionValid = false;
  store.studioAuthorized = false;
  store.uploadSuccess = true;
}

function isAuthorized(request: Request): boolean {
  if (store.studioAuthorized) return true;
  return request.headers.get("x-studio-token") === "valid-token";
}

const sampleProject: ProjectItem = {
  slug: "test-project",
  status: "live",
  visibility: "published",
  defaultFeatured: true,
  title: { zh: "测试项目", en: "Test Project" },
  tagline: { zh: "描述", en: "Tagline" },
  summary: { zh: "摘要", en: "Summary" },
  description: { zh: "详情", en: "Details" },
  design: { zh: "", en: "" },
  architecture: { zh: "", en: "" },
  cover: "/projects/test.svg",
  eta: "2025 Q1",
  progress: 80,
  tech: ["Next.js", "AI"],
  github: "",
  live: "",
  videoUrl: "",
  updatedAt: Date.now(),
};

const sampleMessage: MessageNode = {
  id: "msg-1",
  projectSlug: "test-project",
  parentId: undefined,
  nickname: "测试用户",
  content: "这是一条测试留言",
  authorType: "guest",
  status: "approved",
  createdAt: Date.now(),
  replies: [],
};

export const handlers = [
  // site-content
  http.get("/api/site-content", () => {
    return HttpResponse.json({ content: structuredClone(store.siteContent) });
  }),
  http.post("/api/site-content", async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as { content?: unknown };
    if (!body.content || typeof body.content !== "object") {
      return HttpResponse.json({ error: "Invalid content" }, { status: 400 });
    }
    store.siteContent = body.content as SiteContent;
    return HttpResponse.json({ ok: true });
  }),

  // projects
  http.get("/api/projects", () => {
    return HttpResponse.json({
      projects: store.projects.length > 0 ? [...store.projects] : [sampleProject],
      studioAuthorized: store.studioAuthorized,
    });
  }),
  http.post("/api/projects", async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as { action?: string };
    if (body.action === "seed") {
      store.projects = [{ ...sampleProject }];
    }
    return HttpResponse.json({ ok: true });
  }),

  // messages
  http.get("/api/projects/:slug/messages", () => {
    return HttpResponse.json({
      messages: store.messages.length > 0 ? [...store.messages] : [sampleMessage],
      canPostAsOwner: store.studioAuthorized,
    });
  }),
  http.post("/api/projects/:slug/messages", async ({ request }) => {
    const body = (await request.json()) as { content?: string; nickname?: string; parentId?: string };
    if (!body.content || body.content.trim().length === 0) {
      return HttpResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (body.content.length > 800) {
      return HttpResponse.json({ error: "Content too long" }, { status: 400 });
    }
    const message: MessageNode = {
      id: `msg-${Date.now()}`,
      projectSlug: "test",
      parentId: body.parentId,
      nickname: body.nickname || "访客",
      content: body.content,
      authorType: store.studioAuthorized ? "owner" : "guest",
      status: "approved",
      createdAt: Date.now(),
      replies: [],
    };
    store.messages = [...store.messages, message];
    return HttpResponse.json({ message });
  }),

  // moderate
  http.post("/api/messages/:id/moderate", async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as { status?: string };
    if (body.status !== "approved" && body.status !== "hidden") {
      return HttpResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    return HttpResponse.json({ ok: true });
  }),

  // studio session
  http.get("/api/studio/session", () => {
    return HttpResponse.json({ authenticated: store.sessionValid });
  }),
  http.post("/api/studio/session", async ({ request }) => {
    const body = (await request.json()) as { token?: string };
    if (body.token !== "valid-token" && body.token !== "admin") {
      return HttpResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    store.sessionValid = true;
    store.studioAuthorized = true;
    return new HttpResponse(JSON.stringify({ ok: true }), {
      headers: {
        "Set-Cookie": "studio_session=fake-session; HttpOnly; SameSite=Strict; Path=/",
      },
    });
  }),
  http.delete("/api/studio/session", () => {
    store.sessionValid = false;
    store.studioAuthorized = false;
    return HttpResponse.json({ ok: true });
  }),

  // upload
  http.post("/api/studio/upload", async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!store.uploadSuccess) {
      return HttpResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    return HttpResponse.json({ cover: "/uploads/test-cover.jpg", ok: true });
  }),

  // metrics/visits
  http.get("/api/metrics/visits", () => {
    return HttpResponse.json({ visits: store.visits, enabled: true });
  }),
  http.post("/api/metrics/visits", () => {
    store.visits += 1;
    return HttpResponse.json({ visits: store.visits, enabled: true });
  }),
];
