import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/projects-source";
import { getMessageById, getMessageTreeByProject, createMessage } from "@/lib/messages-source";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

const MAX_CONTENT_LEN = 800;
const MAX_NICKNAME_LEN = 40;
const GUEST_RATE_LIMIT = 8;
const WINDOW_MS = 60 * 1000;
const guestRateMap = new Map<string, number[]>();
const GUEST_NAME_PREFIX = ["星云", "流光", "海盐", "夜航", "银翼", "极光", "深空", "拾光"];
const GUEST_NAME_SUFFIX = ["旅人", "开发者", "访客", "同学", "朋友", "观察者", "建造者", "玩家"];

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 20);
}

function randomGuestNickname(): string {
  const head = GUEST_NAME_PREFIX[Math.floor(Math.random() * GUEST_NAME_PREFIX.length)];
  const tail = GUEST_NAME_SUFFIX[Math.floor(Math.random() * GUEST_NAME_SUFFIX.length)];
  const tag = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${head}${tail}${tag}`;
}

function limitedByRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const items = guestRateMap.get(ipHash) ?? [];
  const recent = items.filter((time) => now - time < WINDOW_MS);
  if (recent.length >= GUEST_RATE_LIMIT) {
    guestRateMap.set(ipHash, recent);
    return true;
  }
  recent.push(now);
  guestRateMap.set(ipHash, recent);
  return false;
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const project = await getProjectBySlug(slug, { includeDraft: true });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const authorized = await isStudioAuthorized({
      tokenHeader: request.headers.get("x-studio-token"),
      sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
    });

    const messages = await getMessageTreeByProject(slug);
    return NextResponse.json({
      messages,
      canPostAsOwner: authorized,
    });
  } catch (error) {
    console.error("GET /api/projects/[slug]/messages failed", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const project = await getProjectBySlug(slug, { includeDraft: true });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const authorized = await isStudioAuthorized({
      tokenHeader: request.headers.get("x-studio-token"),
      sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
    });

    const body = (await request.json()) as {
      parentId?: unknown;
      nickname?: unknown;
      content?: unknown;
    };

    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length > MAX_CONTENT_LEN) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const parentId = typeof body.parentId === "string" ? body.parentId.trim() : "";
    if (parentId) {
      const parent = await getMessageById(slug, parentId);
      if (!parent) {
        return NextResponse.json({ error: "Parent message not found" }, { status: 400 });
      }
    }

    const nicknameRaw = typeof body.nickname === "string" ? body.nickname.trim() : "";
    const nickname = (
      authorized ? process.env.STUDIO_OWNER_NAME || "Author" : nicknameRaw || randomGuestNickname()
    ).slice(0, MAX_NICKNAME_LEN);

    if (!authorized) {
      const ipHash = hashIp(getClientIp(request));
      if (limitedByRateLimit(ipHash)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    const message = await createMessage({
      id: crypto.randomUUID(),
      projectSlug: slug,
      parentId: parentId || undefined,
      authorType: authorized ? "owner" : "guest",
      nickname,
      content,
      status: "approved",
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("POST /api/projects/[slug]/messages failed", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
