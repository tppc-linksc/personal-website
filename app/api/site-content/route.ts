import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getContent, setContent } from "@/lib/site-content";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";
import type { SiteContent } from "@/lib/site-content-types";

export const runtime = "nodejs";

async function ensureAdmin(request: NextRequest): Promise<boolean> {
  return isStudioAuthorized({
    tokenHeader: request.headers.get("x-studio-token"),
    sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
  });
}

function isValidSiteContent(body: unknown): body is SiteContent {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;

  if (!b.hero || typeof b.hero !== "object") return false;
  if (!b.about || typeof b.about !== "object") return false;
  if (!b.brand || typeof b.brand !== "object") return false;
  if (!b.footer || typeof b.footer !== "object") return false;

  const hero = b.hero as Record<string, unknown>;
  for (const field of ["greeting", "title", "summary", "ctaPrimary", "ctaSecondary"]) {
    const v = hero[field];
    if (!v || typeof v !== "object") return false;
    const bilingual = v as Record<string, unknown>;
    if (typeof bilingual.zh !== "string" || typeof bilingual.en !== "string") return false;
  }
  if (typeof hero.ctaPrimaryUrl !== "string" || typeof hero.ctaSecondaryUrl !== "string") return false;

  const about = b.about as Record<string, unknown>;
  const aboutTitle = about.title as Record<string, unknown> | undefined;
  const aboutDesc = about.description as Record<string, unknown> | undefined;
  if (!aboutTitle || typeof aboutTitle.zh !== "string" || typeof aboutTitle.en !== "string") return false;
  if (!aboutDesc || typeof aboutDesc.zh !== "string" || typeof aboutDesc.en !== "string") return false;
  if (!Array.isArray(about.skills)) return false;
  if (typeof about.avatar !== "string") return false;

  const brand = b.brand as Record<string, unknown>;
  if (typeof brand.name !== "string") return false;

  const footer = b.footer as Record<string, unknown>;
  if (typeof footer.github !== "string" || typeof footer.email !== "string") return false;

  return true;
}

export async function GET() {
  return NextResponse.json({ content: getContent() });
}

export async function POST(request: NextRequest) {
  if (!(await ensureAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    if (!isValidSiteContent(body.content)) {
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    setContent(body.content);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
