import { NextRequest, NextResponse } from "next/server";
import { verifyStudioSession, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护 /studio 路由（但不包括 /studio/login）
  if (pathname.startsWith("/studio") && !pathname.startsWith("/studio/login")) {
    const session = request.cookies.get(STUDIO_SESSION_COOKIE)?.value;
    const isAuthenticated = await verifyStudioSession(session);

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/studio/login", request.url));
    }
  }

  // 保护 /content 路由
  if (pathname.startsWith("/content")) {
    const session = request.cookies.get(STUDIO_SESSION_COOKIE)?.value;
    const isAuthenticated = await verifyStudioSession(session);

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/studio/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/content/:path*"],
};
